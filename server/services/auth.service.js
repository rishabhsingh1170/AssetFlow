const pool = require("../config/db");

const getSupabaseConfig = () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
        const error = new Error(
            "Supabase auth is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in server/.env."
        );
        error.statusCode = 500;
        throw error;
    }

    return {
        anonKey,
        baseUrl: `${supabaseUrl.replace(/\/$/, "")}/auth/v1`,
    };
};

const supabaseRequest = async (path, options = {}) => {
    const { anonKey, baseUrl } = getSupabaseConfig();

    const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(
            data.error_description || data.msg || data.message || "Authentication request failed."
        );
        error.statusCode = response.status;
        error.details = data;
        throw error;
    }

    return data;
};

const upsertUserProfile = async (authUser, profile = {}) => {
    const metadata = authUser.user_metadata || {};
    const fullName =
        profile.fullName ||
        profile.full_name ||
        metadata.fullName ||
        metadata.full_name ||
        authUser.email?.split("@")[0] ||
        "Employee";

    const result = await pool.query(
        `
            insert into app_users (
                id,
                department_id,
                full_name,
                email,
                role,
                status,
                phone,
                employee_code
            )
            values ($1,$2,$3,$4,'employee','active',$5,$6)
            on conflict (id) do update
            set
                department_id = coalesce(excluded.department_id, app_users.department_id),
                full_name = excluded.full_name,
                email = excluded.email,
                phone = coalesce(excluded.phone, app_users.phone),
                employee_code = coalesce(excluded.employee_code, app_users.employee_code),
                updated_at = now()
            returning *;
        `,
        [
            authUser.id,
            profile.departmentId || profile.department_id || null,
            fullName,
            authUser.email?.toLowerCase(),
            profile.phone || null,
            profile.employeeCode || profile.employee_code || null,
        ]
    );

    return result.rows[0];
};

const getUserProfile = async (id) => {
    const result = await pool.query(
        `
            select
                u.id,
                u.department_id as "departmentId",
                d.name as "departmentName",
                u.full_name as "fullName",
                u.email,
                u.role,
                u.status,
                u.phone,
                u.employee_code as "employeeCode",
                u.created_at as "createdAt",
                u.updated_at as "updatedAt"
            from app_users u
            left join departments d on d.id = u.department_id
            where u.id = $1;
        `,
        [id]
    );

    return result.rows[0];
};

const signup = async (payload) => {
    const data = await supabaseRequest("/signup", {
        method: "POST",
        body: JSON.stringify({
            email: payload.email,
            password: payload.password,
            data: {
                fullName: payload.fullName,
                phone: payload.phone,
                employeeCode: payload.employeeCode,
            },
        }),
    });

    const authUser = data.user || data;
    const profile = authUser?.id
        ? await upsertUserProfile(authUser, payload)
        : null;

    return {
        session: data.session || null,
        user: profile,
        authUser,
    };
};

const login = async ({ email, password }) => {
    const data = await supabaseRequest("/token?grant_type=password", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });

    const authUser = data.user;
    let profile = authUser?.id ? await getUserProfile(authUser.id) : null;

    if (!profile && authUser?.id) {
        profile = await upsertUserProfile(authUser);
    }

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
        user: profile,
    };
};

const forgotPassword = async ({ email }) =>
    supabaseRequest("/recover", {
        method: "POST",
        body: JSON.stringify({ email }),
    });

module.exports = {
    forgotPassword,
    getUserProfile,
    login,
    signup,
};
