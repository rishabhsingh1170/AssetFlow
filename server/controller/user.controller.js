const userService = require("../services/user.service");

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully.",
            data: users,
        });
    } catch (error) {
        console.error("Get Users Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch users.",
            error: error.message,
        });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("Get User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch user.",
            error: error.message,
        });
    }
};

// Create user profile
const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);

        return res.status(201).json({
            success: true,
            message: "User profile created successfully.",
            data: user,
        });
    } catch (error) {
        console.error("Create User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create user profile.",
            error: error.message,
        });
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userService.updateUser(id, req.body);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully.",
            data: user,
        });
    } catch (error) {
        console.error("Update User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update user.",
            error: error.message,
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userService.deleteUser(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully.",
            data: user,
        });
    } catch (error) {
        console.error("Delete User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete user.",
            error: error.message,
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};