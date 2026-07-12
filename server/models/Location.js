const pool = require("../config/db");

const getAllLocations = async () => {
    const result = await pool.query(`
        select l.*, d.name as department_name
        from locations l
        left join departments d on d.id = l.department_id
        order by l.created_at desc;
    `);

    return result.rows;
};

const getLocationById = async (id) => {
    const result = await pool.query(
        `
            select l.*, d.name as department_name
            from locations l
            left join departments d on d.id = l.department_id
            where l.id = $1;
        `,
        [id]
    );

    return result.rows[0];
};

const createLocation = async (location) => {
    const result = await pool.query(
        `
            insert into locations (
                name,
                code,
                department_id,
                address,
                status
            )
            values ($1,$2,$3,$4,$5)
            returning *;
        `,
        [
            location.name,
            location.code,
            location.department_id || location.departmentId || null,
            location.address || null,
            location.status || "active",
        ]
    );

    return result.rows[0];
};

const updateLocation = async (id, location) => {
    const fieldMap = {
        name: location.name,
        code: location.code,
        department_id: location.department_id || location.departmentId,
        address: location.address,
        status: location.status,
    };

    const sets = [];
    const values = [];

    Object.entries(fieldMap).forEach(([column, value]) => {
        if (value === undefined) return;
        values.push(value);
        sets.push(`${column} = $${values.length}`);
    });

    if (sets.length === 0) return getLocationById(id);

    values.push(id);

    const result = await pool.query(
        `
            update locations
            set ${sets.join(", ")}, updated_at = now()
            where id = $${values.length}
            returning *;
        `,
        values
    );

    return result.rows[0];
};

const deleteLocation = async (id) => {
    const result = await pool.query(
        "delete from locations where id = $1 returning *;",
        [id]
    );

    return result.rows[0];
};

module.exports = {
    createLocation,
    deleteLocation,
    getAllLocations,
    getLocationById,
    updateLocation,
};
