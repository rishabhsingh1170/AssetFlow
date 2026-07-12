const crypto = require("crypto");
require("../config/env");
const pool = require("../config/db");

const getBearerToken = (req) => {
    const header = req.headers.authorization || req.headers.Authorization;

    if (!header || typeof header !== "string") return null;

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) return null;

    return token;
};

const base64UrlDecode = (value) => {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        "="
    );

    return Buffer.from(padded, "base64").toString("utf8");
};

const base64UrlEncode = (value) =>
    Buffer.from(value)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

const timingSafeEqual = (left, right) => {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) return false;

    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const verifyJwt = (token) => {
    const secret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;

    if (!secret) {
        const error = new Error("JWT secret is not configured.");
        error.statusCode = 500;
        throw error;
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
        const error = new Error("Invalid token format.");
        error.statusCode = 401;
        throw error;
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const header = JSON.parse(base64UrlDecode(encodedHeader));
    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    if (header.alg !== "HS256") {
        const error = new Error("Unsupported token algorithm.");
        error.statusCode = 401;
        throw error;
    }

    const expectedSignature = base64UrlEncode(
        crypto
            .createHmac("sha256", secret)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest()
    );

    if (!timingSafeEqual(signature, expectedSignature)) {
        const error = new Error("Invalid token signature.");
        error.statusCode = 401;
        throw error;
    }

    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp <= now) {
        const error = new Error("Token has expired.");
        error.statusCode = 401;
        throw error;
    }

    if (payload.nbf && payload.nbf > now) {
        const error = new Error("Token is not active yet.");
        error.statusCode = 401;
        throw error;
    }

    return payload;
};

const findActiveUser = async (authUserId) => {
    const { rows } = await pool.query(
        `
            select
                u.id,
                u.full_name as "fullName",
                u.email,
                u.role,
                u.status,
                u.department_id as "departmentId",
                d.name as "departmentName",
                u.employee_code as "employeeCode",
                u.phone
            from app_users u
            left join departments d on d.id = u.department_id
            where u.id = $1
            limit 1
        `,
        [authUserId]
    );

    return rows[0] || null;
};

const sendAuthError = (res, statusCode, message) =>
    res.status(statusCode).json({
        success: false,
        message,
    });

const authenticate = async (req, res, next) => {
    try {
        const token = getBearerToken(req);

        if (!token) {
            return sendAuthError(res, 401, "Authentication token is required.");
        }

        const payload = verifyJwt(token);
        const authUserId = payload.sub || payload.user_id;

        if (!authUserId) {
            return sendAuthError(res, 401, "Token does not include a user ID.");
        }

        const user = await findActiveUser(authUserId);

        if (!user) {
            return sendAuthError(res, 401, "User profile was not found.");
        }

        if (user.status !== "active") {
            return sendAuthError(res, 403, "User account is inactive.");
        }

        req.token = token;
        req.auth = payload;
        req.user = user;

        return next();
    } catch (error) {
        const statusCode = error.statusCode || 401;
        const message =
            statusCode === 500
                ? "Authentication is not configured correctly."
                : error.message || "Authentication failed.";

        return sendAuthError(res, statusCode, message);
    }
};

const optionalAuth = async (req, res, next) => {
    const token = getBearerToken(req);

    if (!token) return next();

    return authenticate(req, res, next);
};

module.exports = {
    authenticate,
    optionalAuth,
    requireAuth: authenticate,
    verifyJwt,
};
