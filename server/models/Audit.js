const pool = require("../config/db");

const getAuditLogs = async (filters = {}) => {
    const values = [];
    const where = [];

    if (filters.actorUserId || filters.actor_user_id) {
        values.push(filters.actorUserId || filters.actor_user_id);
        where.push(`l.actor_user_id = $${values.length}`);
    }

    if (filters.entityTable || filters.entity_table) {
        values.push(filters.entityTable || filters.entity_table);
        where.push(`l.entity_table = $${values.length}`);
    }

    if (filters.action) {
        values.push(filters.action);
        where.push(`l.action = $${values.length}`);
    }

    const limit = Math.min(Number(filters.limit) || 100, 500);
    values.push(limit);

    const result = await pool.query(
        `
            select
                l.*,
                u.full_name as actor_name,
                u.email as actor_email
            from activity_logs l
            left join app_users u on u.id = l.actor_user_id
            ${where.length ? `where ${where.join(" and ")}` : ""}
            order by l.created_at desc
            limit $${values.length};
        `,
        values
    );

    return result.rows;
};

module.exports = {
    getAuditLogs,
};
