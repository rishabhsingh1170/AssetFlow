const departmentModel = require("../models/department");

// Get all departments
const getAllDepartments = async () => {
    return await departmentModel.getAllDepartments();
};

// Get department by ID
const getDepartmentById = async (id) => {
    return await departmentModel.getDepartmentById(id);
};

// Create department
const createDepartment = async (departmentData) => {
    return await departmentModel.createDepartment(departmentData);
};

// Update department
const updateDepartment = async (id, departmentData) => {
    return await departmentModel.updateDepartment(id, departmentData);
};

// Delete department
const deleteDepartment = async (id) => {
    return await departmentModel.deleteDepartment(id);
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
};