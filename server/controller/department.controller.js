const departmentService = require("../services/department.service");

// Get all departments
const getAllDepartments = async (req, res) => {
    try {
        const departments = await departmentService.getAllDepartments();

        return res.status(200).json({
            success: true,
            message: "Departments fetched successfully.",
            data: departments,
        });
    } catch (error) {
        console.error("Get Departments Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch departments.",
            error: error.message,
        });
    }
};

// Get department by ID
const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await departmentService.getDepartmentById(id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: department,
        });
    } catch (error) {
        console.error("Get Department Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch department.",
            error: error.message,
        });
    }
};

// Create department
const createDepartment = async (req, res) => {
    try {
        const department = await departmentService.createDepartment(req.body);

        return res.status(201).json({
            success: true,
            message: "Department created successfully.",
            data: department,
        });
    } catch (error) {
        console.error("Create Department Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create department.",
            error: error.message,
        });
    }
};

// Update department
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await departmentService.updateDepartment(
            id,
            req.body
        );

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Department updated successfully.",
            data: department,
        });
    } catch (error) {
        console.error("Update Department Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update department.",
            error: error.message,
        });
    }
};

// Delete department
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await departmentService.deleteDepartment(id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Department deleted successfully.",
            data: department,
        });
    } catch (error) {
        console.error("Delete Department Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete department.",
            error: error.message,
        });
    }
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
};