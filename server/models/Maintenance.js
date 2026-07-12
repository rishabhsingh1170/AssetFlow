const pool = require("../config/db");

const getAllMaintenanceRequests = async (filters = {}) => {
    const values = [];
    const where = [];

    const add = (column, value) => {
        if (value === undefined || value === null || value === "") return;
        values.push(value);
        where.push(`m.${column} = $${values.length}`);
    };

    add("asset_id", filters.assetId || filters.asset_id);
    add("requested_by", filters.requestedBy || filters.requested_by);
    add("technician_user_id", filters.technicianUserId || filters.technician_user_id);
    add("status", filters.status);
    add("priority", filters.priority);

    const result = await pool.query(
        `
            select
                m.*,
                a.asset_tag,
                a.name as asset_name,
                requester.full_name as requested_by_name,
                technician.full_name as technician_name
            from maintenance_requests m
            join assets a on a.id = m.asset_id
            left join app_users requester on requester.id = m.requested_by
            left join app_users technician on technician.id = m.technician_user_id
            ${where.length ? `where ${where.join(" and ")}` : ""}
            order by m.created_at desc;
        `,
        values
    );

    return result.rows;
};

const getMaintenanceRequestById = async (id) => {
    const result = await pool.query(
        `
            select
                m.*,
                a.asset_tag,
                a.name as asset_name,
                requester.full_name as requested_by_name,
                technician.full_name as technician_name
            from maintenance_requests m
            join assets a on a.id = m.asset_id
            left join app_users requester on requester.id = m.requested_by
            left join app_users technician on technician.id = m.technician_user_id
            where m.id = $1;
        `,
        [id]
    );

    return result.rows[0];
};

const createMaintenanceRequest = async (maintenance) => {
    const client = await pool.connect();

    try {
        await client.query("begin");

        const result = await client.query(
            `
                insert into maintenance_requests (
                    asset_id,
                    requested_by,
                    issue_description,
                    priority,
                    status,
                    estimated_cost
                )
                values ($1,$2,$3,$4,$5,$6)
                returning *;
            `,
            [
                maintenance.asset_id || maintenance.assetId,
                maintenance.requested_by || maintenance.requestedBy,
                maintenance.issue_description || maintenance.issueDescription,
                maintenance.priority || "medium",
                maintenance.status || "pending",
                maintenance.estimated_cost ?? maintenance.estimatedCost ?? null,
            ]
        );

        if (["approved", "technician_assigned", "in_progress"].includes(result.rows[0].status)) {
            await client.query(
                "update assets set status = 'under_maintenance', updated_at = now() where id = $1;",
                [result.rows[0].asset_id]
            );
        }

        await client.query("commit");
        return result.rows[0];
    } catch (error) {
        await client.query("rollback");
        throw error;
    } finally {
        client.release();
    }
};

const updateMaintenanceRequest = async (id, maintenance) => {
    const client = await pool.connect();

    try {
        await client.query("begin");

        const current = await client.query(
            "select * from maintenance_requests where id = $1 for update;",
            [id]
        );

        if (!current.rows[0]) {
            await client.query("rollback");
            return null;
        }

        const status = maintenance.status;
        const fieldMap = {
            asset_id: maintenance.asset_id || maintenance.assetId,
            issue_description:
                maintenance.issue_description || maintenance.issueDescription,
            priority: maintenance.priority,
            status,
            approved_by:
                status === "approved"
                    ? maintenance.approved_by || maintenance.approvedBy || null
                    : maintenance.approved_by || maintenance.approvedBy,
            approved_at:
                status === "approved"
                    ? new Date()
                    : maintenance.approved_at || maintenance.approvedAt,
            rejected_by:
                status === "rejected"
                    ? maintenance.rejected_by || maintenance.rejectedBy || null
                    : maintenance.rejected_by || maintenance.rejectedBy,
            rejected_at:
                status === "rejected"
                    ? new Date()
                    : maintenance.rejected_at || maintenance.rejectedAt,
            technician_user_id:
                maintenance.technician_user_id || maintenance.technicianUserId,
            started_at:
                status === "in_progress"
                    ? new Date()
                    : maintenance.started_at || maintenance.startedAt,
            resolved_at:
                status === "resolved"
                    ? new Date()
                    : maintenance.resolved_at || maintenance.resolvedAt,
            resolution_notes:
                maintenance.resolution_notes || maintenance.resolutionNotes,
            estimated_cost: maintenance.estimated_cost ?? maintenance.estimatedCost,
            actual_cost: maintenance.actual_cost ?? maintenance.actualCost,
        };

        const sets = [];
        const values = [];

        Object.entries(fieldMap).forEach(([column, value]) => {
            if (value === undefined) return;
            values.push(value);
            sets.push(`${column} = $${values.length}`);
        });

        if (sets.length === 0) {
            await client.query("commit");
            return current.rows[0];
        }

        values.push(id);

        const updated = await client.query(
            `
                update maintenance_requests
                set ${sets.join(", ")}, updated_at = now()
                where id = $${values.length}
                returning *;
            `,
            values
        );

        if (["approved", "technician_assigned", "in_progress"].includes(status)) {
            await client.query(
                "update assets set status = 'under_maintenance', updated_at = now() where id = $1;",
                [updated.rows[0].asset_id]
            );
        }

        if (status === "resolved") {
            await client.query(
                "update assets set status = 'available', updated_at = now() where id = $1;",
                [updated.rows[0].asset_id]
            );
        }

        await client.query("commit");
        return updated.rows[0];
    } catch (error) {
        await client.query("rollback");
        throw error;
    } finally {
        client.release();
    }
};

const deleteMaintenanceRequest = async (id) => {
    const result = await pool.query(
        "delete from maintenance_requests where id = $1 returning *;",
        [id]
    );

    return result.rows[0];
};

module.exports = {
    createMaintenanceRequest,
    deleteMaintenanceRequest,
    getAllMaintenanceRequests,
    getMaintenanceRequestById,
    updateMaintenanceRequest,
};
