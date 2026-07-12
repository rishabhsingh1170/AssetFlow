const authService = require("../services/auth.service");

const sendError = (res, error, fallbackMessage) =>
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || fallbackMessage,
        details: error.details,
    });

const signup = async (req, res) => {
    try {
        const data = await authService.signup(req.body);

        return res.status(201).json({
            success: true,
            message: "Signup successful.",
            data,
        });
    } catch (error) {
        return sendError(res, error, "Signup failed.");
    }
};

const login = async (req, res) => {
    try {
        const data = await authService.login(req.body);

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data,
        });
    } catch (error) {
        return sendError(res, error, "Login failed.");
    }
};

const me = async (req, res) => {
    try {
        const user = await authService.getUserProfile(req.user.id);

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        return sendError(res, error, "Failed to fetch current user.");
    }
};

const forgotPassword = async (req, res) => {
    try {
        await authService.forgotPassword(req.body);

        return res.status(200).json({
            success: true,
            message: "Password recovery email sent if the account exists.",
        });
    } catch (error) {
        return sendError(res, error, "Failed to start password recovery.");
    }
};

const logout = (req, res) =>
    res.status(200).json({
        success: true,
        message: "Logout successful. Remove the token on the client.",
    });

module.exports = {
    forgotPassword,
    login,
    logout,
    me,
    signup,
};
