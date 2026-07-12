const pool = require("../config/db");

// Get all users
const getAllUsers = async () => {
    const query = `
        SELECT *
        FROM app_users
        ORDER BY created_at DESC;
    `;

    const result = await pool.query(query);
    return result.rows;
};

// Get user by ID
const getUserById = async (id) => {
    const query = `
        SELECT *
        FROM app_users
        WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
};

// Create user profile
const createUser = async (user) => {
    const {
        id,
        department_id = null,
        full_name,
        email,
        role = "employee",
        status = "active",
        phone = null,
        employee_code = null,
        promoted_by = null,
        promoted_at = null,
    } = user;

    const query = `
        INSERT INTO app_users (
            id,
            department_id,
            full_name,
            email,
            role,
            status,
            phone,
            employee_code,
            promoted_by,
            promoted_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *;
    `;

    const result = await pool.query(query, [
        id,
        department_id,
        full_name,
        email,
        role,
        status,
        phone,
        employee_code,
        promoted_by,
        promoted_at,
    ]);

    return result.rows[0];
};

// Update user
const updateUser = async (id, user) => {
    const {
        department_id,
        full_name,
        email,
        role,
        status,
        phone,
        employee_code,
    } = user;

    const query = `
        UPDATE app_users
        SET
            department_id = $1,
            full_name = $2,
            email = $3,
            role = $4,
            status = $5,
            phone = $6,
            employee_code = $7
        WHERE id = $8
        RETURNING *;
    `;

    const result = await pool.query(query, [
        department_id,
        full_name,
        email,
        role,
        status,
        phone,
        employee_code,
        id,
    ]);

    return result.rows[0];
};

// Delete user
const deleteUser = async (id) => {
    const query = `
        DELETE FROM app_users
        WHERE id = $1
        RETURNING *;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};