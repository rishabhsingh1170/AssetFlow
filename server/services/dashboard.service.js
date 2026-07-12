const pool = require("../config/db");

const getDashboardSummary = async (options = {}) => {
    const limit = Math.min(Number(options.limit) || 10, 50);

    const [
        assetCounts,
        departmentCount,
        userCount,
        bookingCounts,
        maintenanceCounts,
        transferCounts,
        overdueReturns,
        upcomingReturns,
        recentBookings,
        recentTransfers,
        recentMaintenance,
        assetsByStatus,
        assetsByCategory,
        allocationsByDepartment,
        bookingHeatmap,
    ] = await Promise.all([
        pool.query(`
            select
                count(*)::int as "totalAssets",
                count(*) filter (where status = 'allocated')::int as "allocatedAssets",
                count(*) filter (where status = 'available')::int as "availableAssets",
                count(*) filter (where status = 'reserved')::int as "reservedAssets",
                count(*) filter (where status = 'under_maintenance')::int as "maintenanceAssets",
                count(*) filter (where status = 'lost')::int as "lostAssets",
                count(*) filter (where status in ('retired', 'disposed'))::int as "retiredOrDisposedAssets"
            from assets;
        `),
        pool.query("select count(*)::int as count from departments where status = 'active';"),
        pool.query("select count(*)::int as count from app_users where status = 'active';"),
        pool.query(`
            select
                count(*) filter (where status in ('requested', 'approved', 'upcoming', 'ongoing'))::int as "activeBookings",
                count(*) filter (where status = 'requested')::int as "requestedBookings",
                count(*) filter (where status = 'approved')::int as "approvedBookings",
                count(*) filter (where status = 'ongoing')::int as "ongoingBookings",
                count(*) filter (
                    where starts_at >= now()
                      and starts_at < now() + interval '24 hours'
                      and status in ('approved', 'upcoming')
                )::int as "bookingsNext24Hours"
            from resource_bookings;
        `),
        pool.query(`
            select
                count(*) filter (where status in ('pending', 'approved', 'technician_assigned', 'in_progress'))::int as "openMaintenance",
                count(*) filter (where status = 'pending')::int as "pendingMaintenance",
                count(*) filter (where status = 'in_progress')::int as "maintenanceInProgress",
                count(*) filter (
                    where created_at::date = current_date
                       or approved_at::date = current_date
                       or started_at::date = current_date
                       or resolved_at::date = current_date
                )::int as "maintenanceToday"
            from maintenance_requests;
        `),
        pool.query(`
            select
                count(*) filter (where status = 'requested')::int as "pendingTransfers",
                count(*) filter (where status = 'approved')::int as "approvedTransfers",
                count(*) filter (where status = 'rejected')::int as "rejectedTransfers"
            from asset_transfer_requests;
        `),
        pool.query(
            `
                select
                    aa.id,
                    aa.asset_id,
                    aa.holder_type,
                    aa.holder_user_id,
                    aa.holder_department_id,
                    aa.allocated_at,
                    aa.expected_return_at,
                    a.asset_tag,
                    a.name as asset_name,
                    u.full_name as holder_user_name,
                    d.name as holder_department_name
                from asset_allocations aa
                join assets a on a.id = aa.asset_id
                left join app_users u on u.id = aa.holder_user_id
                left join departments d on d.id = aa.holder_department_id
                where aa.status = 'active'
                  and aa.expected_return_at is not null
                  and aa.expected_return_at < now()
                order by aa.expected_return_at asc
                limit $1;
            `,
            [limit]
        ),
        pool.query(
            `
                select
                    aa.id,
                    aa.asset_id,
                    aa.holder_type,
                    aa.holder_user_id,
                    aa.holder_department_id,
                    aa.allocated_at,
                    aa.expected_return_at,
                    a.asset_tag,
                    a.name as asset_name,
                    u.full_name as holder_user_name,
                    d.name as holder_department_name
                from asset_allocations aa
                join assets a on a.id = aa.asset_id
                left join app_users u on u.id = aa.holder_user_id
                left join departments d on d.id = aa.holder_department_id
                where aa.status = 'active'
                  and aa.expected_return_at between now() and now() + interval '7 days'
                order by aa.expected_return_at asc
                limit $1;
            `,
            [limit]
        ),
        pool.query(`
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
            order by b.created_at desc
            limit $1;
        `, [limit]),
        pool.query(`
            select
                t.*,
                a.asset_tag,
                a.name as asset_name,
                u.full_name as requested_by_name,
                target_user.full_name as target_user_name,
                target_department.name as target_department_name
            from asset_transfer_requests t
            join assets a on a.id = t.asset_id
            left join app_users u on u.id = t.requested_by
            left join app_users target_user on target_user.id = t.target_user_id
            left join departments target_department on target_department.id = t.target_department_id
            order by t.created_at desc
            limit $1;
        `, [limit]),
        pool.query(
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
                order by m.created_at desc
                limit $1;
            `,
            [limit]
        ),
        pool.query(`
            select status, count(*)::int as count
            from assets
            group by status
            order by status;
        `),
        pool.query(`
            select
                c.id,
                c.name,
                count(a.id)::int as count
            from asset_categories c
            left join assets a on a.category_id = c.id
            group by c.id, c.name
            order by count desc, c.name;
        `),
        pool.query(`
            select
                d.id,
                d.name,
                count(aa.id)::int as allocated_assets
            from departments d
            left join asset_allocations aa
                on aa.holder_department_id = d.id
               and aa.status = 'active'
            group by d.id, d.name
            order by allocated_assets desc, d.name
            limit 10;
        `),
        pool.query(`
            select
                extract(hour from starts_at)::int as hour,
                count(*)::int as bookings
            from resource_bookings
            where starts_at >= now() - interval '30 days'
            group by extract(hour from starts_at)
            order by hour;
        `),
    ]);

    const assetSummary = assetCounts.rows[0];
    const bookingSummary = bookingCounts.rows[0];
    const maintenanceSummary = maintenanceCounts.rows[0];
    const transferSummary = transferCounts.rows[0];

    return {
        totalAssets: assetSummary.totalAssets,
        allocatedAssets: assetSummary.allocatedAssets,
        availableAssets: assetSummary.availableAssets,
        maintenanceAssets: assetSummary.maintenanceAssets,
        departments: departmentCount.rows[0].count,
        users: userCount.rows[0].count,
        activeBookings: bookingSummary.activeBookings,
        pendingTransfers: transferSummary.pendingTransfers,
        upcomingReturns: upcomingReturns.rows.length,
        overdueReturns: overdueReturns.rows.length,
        maintenanceToday: maintenanceSummary.maintenanceToday,
        kpis: {
            assetsAvailable: assetSummary.availableAssets,
            assetsAllocated: assetSummary.allocatedAssets,
            assetsReserved: assetSummary.reservedAssets,
            assetsUnderMaintenance: assetSummary.maintenanceAssets,
            maintenanceToday: maintenanceSummary.maintenanceToday,
            activeBookings: bookingSummary.activeBookings,
            pendingTransfers: transferSummary.pendingTransfers,
            upcomingReturns: upcomingReturns.rows.length,
            overdueReturns: overdueReturns.rows.length,
            departments: departmentCount.rows[0].count,
            users: userCount.rows[0].count,
        },
        summaries: {
            assets: assetSummary,
            bookings: bookingSummary,
            maintenance: maintenanceSummary,
            transfers: transferSummary,
        },
        alerts: {
            overdueReturns: overdueReturns.rows,
            upcomingReturns: upcomingReturns.rows,
        },
        recentBookings: recentBookings.rows,
        recentTransfers: recentTransfers.rows,
        recentMaintenance: recentMaintenance.rows,
        charts: {
            assetsByStatus: assetsByStatus.rows,
            assetsByCategory: assetsByCategory.rows,
            allocationsByDepartment: allocationsByDepartment.rows,
            bookingHeatmap: bookingHeatmap.rows,
        },
    };
};

module.exports = {
    getDashboardSummary,
};
