const userModel = require("../models/User");

// Get all users
const getAllUsers = async () => {
    return await userModel.getAllUsers();
};

// Get user by ID
const getUserById = async (id) => {
    return await userModel.getUserById(id);
};

// Create user profile
const createUser = async (userData) => {
    return await userModel.createUser(userData);
};

// Update user
const updateUser = async (id, userData) => {
    return await userModel.updateUser(id, userData);
};

// Delete user
const deleteUser = async (id) => {
    return await userModel.deleteUser(id);
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};