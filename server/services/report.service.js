const pool = require("../config/db");

const getAssetReport = async () => {
    const result = await pool.query(`
        select
            a.id,
            a.asset_tag,
            a.name,
            a.status,
            a.condition,
            c.name as category_name,
            l.name as location_name,
            d.name as department_name,
            a.acquisition_date,
            a.acquisition_cost,
            a.created_at
        from assets a
        left join asset_categories c on c.id = a.category_id
        left join locations l on l.id = a.location_id
        left join departments d on d.id = a.owning_department_id
        order by a.created_at desc;
    `);

    return result.rows;
};

const getBookingReport = async () => {
    const result = await pool.query(`
        select
            b.id,
            b.status,
            b.starts_at,
            b.ends_at,
            b.purpose,
            a.asset_tag,
            a.name as asset_name,
            u.full_name as booked_by_name,
            d.name as department_name,
            b.created_at
        from resource_bookings b
        join assets a on a.id = b.asset_id
        left join app_users u on u.id = b.booked_by
        left join departments d on d.id = b.department_id
        order by b.starts_at desc;
    `);

    return result.rows;
};

const getMaintenanceReport = async () => {
    const result = await pool.query(`
        select
            m.id,
            m.status,
            m.priority,
            m.issue_description,
            m.resolution_notes,
            m.estimated_cost,
            m.actual_cost,
            a.asset_tag,
            a.name as asset_name,
            c.name as category_name,
            requester.full_name as requested_by_name,
            technician.full_name as technician_name,
            m.created_at,
            m.resolved_at
        from maintenance_requests m
        join assets a on a.id = m.asset_id
        left join asset_categories c on c.id = a.category_id
        left join app_users requester on requester.id = m.requested_by
        left join app_users technician on technician.id = m.technician_user_id
        order by m.created_at desc;
    `);

    return result.rows;
};

module.exports = {
    getAssetReport,
    getBookingReport,
    getMaintenanceReport,
};
