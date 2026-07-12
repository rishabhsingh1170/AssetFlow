const pool = require("../config/db");

// Get all departments
const getAllDepartments = async () => {
    const query = `
        SELECT *
        FROM departments
        ORDER BY created_at DESC;
    `;

    const result = await pool.query(query);
    return result.rows;
};

// Get department by ID
const getDepartmentById = async (id) => {
    const query = `
        SELECT *
        FROM departments
        WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
};

// Create department
const createDepartment = async (department) => {
    const {
        name,
        code,
        parent_department_id = null,
        head_user_id = null,
        status = "active",
    } = department;

    const query = `
        INSERT INTO departments (
            name,
            code,
            parent_department_id,
            head_user_id,
            status
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

    const result = await pool.query(query, [
        name,
        code,
        parent_department_id,
        head_user_id,
        status,
    ]);

    return result.rows[0];
};

// Update department
const updateDepartment = async (id, department) => {
    const {
        name,
        code,
        parent_department_id = null,
        head_user_id = null,
        status,
    } = department;

    const query = `
        UPDATE departments
        SET
            name = $1,
            code = $2,
            parent_department_id = $3,
            head_user_id = $4,
            status = $5
        WHERE id = $6
        RETURNING *;
    `;

    const result = await pool.query(query, [
        name,
        code,
        parent_department_id,
        head_user_id,
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