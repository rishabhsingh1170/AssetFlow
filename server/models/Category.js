const pool = require("../config/db");

// Get all categories
const getAllCategories = async () => {
    const query = `
        SELECT *
        FROM asset_categories
        ORDER BY created_at DESC;
    `;

    const result = await pool.query(query);
    return result.rows;
};

// Get category by ID
const getCategoryById = async (id) => {
    const query = `
        SELECT *
        FROM asset_categories
        WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
};

// Create category
const createCategory = async (category) => {
    const {
        name,
        code,
        description = null,
        custom_fields = {},
        status = "active",
    } = category;

    const query = `
        INSERT INTO asset_categories
        (
            name,
            code,
            description,
            custom_fields,
            status
        )
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *;
    `;

    const result = await pool.query(query, [
        name,
        code,
        description,
        custom_fields,
        status,
    ]);

    return result.rows[0];
};

// Update category
const updateCategory = async (id, category) => {
    const {
        name,
        code,
        description = null,
        custom_fields = {},
        status,
    } = category;

    const query = `
        UPDATE asset_categories
        SET
            name = $1,
            code = $2,
            description = $3,
            custom_fields = $4,
            status = $5
        WHERE id = $6
        RETURNING *;
    `;

    const result = await pool.query(query, [
        name,
        code,
        description,
        custom_fields,
        status,
        id,
    ]);

    return result.rows[0];
};

// Delete category
const deleteCategory = async (id) => {
    const query = `
        DELETE FROM asset_categories
        WHERE id = $1
        RETURNING *;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};