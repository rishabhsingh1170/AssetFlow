const categoryModel = require("../models/Category");

// Get all categories
const getAllCategories = async () => {
    return await categoryModel.getAllCategories();
};

// Get category by ID
const getCategoryById = async (id) => {
    return await categoryModel.getCategoryById(id);
};

// Create category
const createCategory = async (categoryData) => {
    return await categoryModel.createCategory(categoryData);
};

// Update category
const updateCategory = async (id, categoryData) => {
    return await categoryModel.updateCategory(id, categoryData);
};

// Delete category
const deleteCategory = async (id) => {
    return await categoryModel.deleteCategory(id);
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};