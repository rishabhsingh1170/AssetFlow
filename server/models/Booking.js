const pool = require("../config/db");

const getAllBookings = async (filters = {}) => {
    const values = [];
    const where = [];

    const add = (column, value) => {
        if (value === undefined || value === null || value === "") return;
        values.push(value);
        where.push(`b.${column} = $${values.length}`);
    };

    add("asset_id", filters.assetId || filters.asset_id);
    add("booked_by", filters.bookedBy || filters.booked_by);
    add("department_id", filters.departmentId || filters.department_id);
    add("status", filters.status);

    if (filters.startsAfter) {
        values.push(filters.startsAfter);
        where.push(`b.starts_at >= $${values.length}`);
    }

    if (filters.endsBefore) {
        values.push(filters.endsBefore);
        where.push(`b.ends_at <= $${values.length}`);
    }

    const result = await pool.query(
        `
            select
                b.*,
                a.asset_tag,
                a.name as asset_name,
                u.full_name as booked_by_name,
                d.name as department_name
            from resource_bookings b
            join assets a on a.id = b.asset_id
            left join app_users u on u.id = b.booked_by
            left join departments d on d.id = b.department_id
            ${where.length ? `where ${where.join(" and ")}` : ""}
            order by b.starts_at desc;
        `,
        values
    );

    return result.rows;
};

const getBookingById = async (id) => {
    const result = await pool.query(
        `
            select
                b.*,
                a.asset_tag,
                a.name as asset_name,
                u.full_name as booked_by_name,
                d.name as department_name
            from resource_bookings b
            join assets a on a.id = b.asset_id
            left join app_users u on u.id = b.booked_by
            left join departments d on d.id = b.department_id
            where b.id = $1;
        `,
        [id]
    );

    return result.rows[0];
};

const createBooking = async (booking) => {
    const client = await pool.connect();

    try {
        await client.query("begin");

        const assetResult = await client.query(
            "select * from assets where id = $1 for update;",
            [booking.asset_id || booking.assetId]
        );
        const asset = assetResult.rows[0];

        if (!asset) {
            const error = new Error("Asset not found.");
            error.statusCode = 404;
            throw error;
        }

        if (!asset.is_shared_bookable) {
            const error = new Error("Asset is not a bookable shared resource.");
            error.statusCode = 400;
            throw error;
        }

        const result = await client.query(
            `
                insert into resource_bookings (
                    asset_id,
                    booked_by,
                    department_id,
                    starts_at,
                    ends_at,
                    status,
                    purpose
                )
                values ($1,$2,$3,$4,$5,$6,$7)
                returning *;
            `,
            [
                booking.asset_id || booking.assetId,
                booking.booked_by || booking.bookedBy,
                booking.department_id || booking.departmentId || null,
                booking.starts_at || booking.startsAt,
                booking.ends_at || booking.endsAt,
                booking.status || "requested",
                booking.purpose || null,
            ]
        );

        await client.query("commit");
        return result.rows[0];
    } catch (error) {
        await client.query("rollback");
        throw error;
    } finally {
        client.release();
    }
};

const updateBooking = async (id, booking) => {
    const client = await pool.connect();

    try {
        await client.query("begin");

        const currentResult = await client.query(
            "select * from resource_bookings where id = $1 for update;",
            [id]
        );
        const current = currentResult.rows[0];

        if (!current) {
            await client.query("rollback");
            return null;
        }

        const fieldMap = {
            asset_id: booking.asset_id || booking.assetId,
            booked_by: booking.booked_by || booking.bookedBy,
            department_id: booking.department_id || booking.departmentId,
            starts_at: booking.starts_at || booking.startsAt,
            ends_at: booking.ends_at || booking.endsAt,
            status: booking.status,
            purpose: booking.purpose,
            cancelled_by: booking.cancelled_by || booking.cancelledBy,
            cancelled_at:
                booking.status === "cancelled"
                    ? new Date()
                    : booking.cancelled_at || booking.cancelledAt,
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
            return current;
        }

        values.push(id);

        const updated = await client.query(
            `
                update resource_bookings
                set ${sets.join(", ")}, updated_at = now()
                where id = $${values.length}
                returning *;
            `,
            values
        );

        if (["approved", "upcoming", "ongoing"].includes(booking.status)) {
            await client.query(
                `
                    update assets
                    set status = 'reserved', updated_at = now()
                    where id = $1 and status = 'available';
                `,
                [updated.rows[0].asset_id]
            );
        }

        if (["completed", "cancelled", "rejected"].includes(booking.status)) {
            await client.query(
                `
                    update assets
                    set status = 'available', updated_at = now()
                    where id = $1
                      and status = 'reserved'
                      and not exists (
                        select 1 from resource_bookings
                        where asset_id = $1
                          and id <> $2
                          and status in ('requested', 'approved', 'upcoming', 'ongoing')
                      );
                `,
                [updated.rows[0].asset_id, id]
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

const deleteBooking = async (id) => {
    const result = await pool.query(
        "delete from resource_bookings where id = $1 returning *;",
        [id]
    );

    return result.rows[0];
};

module.exports = {
    createBooking,
    deleteBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
};
