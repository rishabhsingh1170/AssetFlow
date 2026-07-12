const pool = require("../config/db");

// Get all departments
const getAllDepartments = async () => {
    const query = `
        SELECT *
        FROM departments
        ORDER BY id ASC
    `;

    const result = await pool.query(query);

    return result.rows;
};

// Get department by ID
const getDepartmentById = async (id) => {
    const query = `
        SELECT *
        FROM departments
        WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
};

// Create department
const createDepartment = async (department) => {
    const { name, status } = department;

    const query = `
        INSERT INTO departments (name, status)
        VALUES ($1, $2)
        RETURNING *;
    `;

    const result = await pool.query(query, [
        name,
        status,
    ]);

    return result.rows[0];
};

// Update department
const updateDepartment = async (id, department) => {
    const { name, status } = department;

    const query = `
        UPDATE departments
        SET
            name = $1,
            status = $2
        WHERE id = $3
        RETURNING *;
    `;

    const result = await pool.query(query, [
        name,
        status,
        id,
    ]);

    return result.rows[0];
};

// Delete department
const deleteDepartment = async (id) => {
    const query = `
        DELETE FROM departments
        WHERE id = $1
        RETURNING *;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
};

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
};