const pool = require("../config/db");

const getDashboardSummary = async () => {
    const [
        assetCounts,
        departmentCount,
        userCount,
        recentBookings,
        recentTransfers,
    ] = await Promise.all([
        pool.query(`
            select
                count(*)::int as "totalAssets",
                count(*) filter (where status = 'allocated')::int as "allocatedAssets",
                count(*) filter (where status = 'available')::int as "availableAssets",
                count(*) filter (where status = 'under_maintenance')::int as "maintenanceAssets"
            from assets;
        `),
        pool.query("select count(*)::int as count from departments;"),
        pool.query("select count(*)::int as count from app_users;"),
        pool.query(`
            select
                b.*,
                a.asset_tag,
                a.name as asset_name,
                u.full_name as booked_by_name
            from resource_bookings b
            join assets a on a.id = b.asset_id
            left join app_users u on u.id = b.booked_by
            order by b.created_at desc
            limit 10;
        `),
        pool.query(`
            select
                t.*,
                a.asset_tag,
                a.name as asset_name,
                u.full_name as requested_by_name
            from asset_transfer_requests t
            join assets a on a.id = t.asset_id
            left join app_users u on u.id = t.requested_by
            order by t.created_at desc
            limit 10;
        `),
    ]);

    return {
        totalAssets: assetCounts.rows[0].totalAssets,
        allocatedAssets: assetCounts.rows[0].allocatedAssets,
        availableAssets: assetCounts.rows[0].availableAssets,
        maintenanceAssets: assetCounts.rows[0].maintenanceAssets,
        departments: departmentCount.rows[0].count,
        users: userCount.rows[0].count,
        recentBookings: recentBookings.rows,
        recentTransfers: recentTransfers.rows,
    };
};

module.exports = {
    getDashboardSummary,
};
