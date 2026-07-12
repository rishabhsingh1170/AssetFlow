const pool = require("../config/db");

const toAssetRow = (asset = {}) => ({
    name: asset.name,
    category_id: asset.category_id || asset.categoryId,
    serial_number: asset.serial_number || asset.serialNumber || null,
    acquisition_date: asset.acquisition_date || asset.acquisitionDate || null,
    acquisition_cost: asset.acquisition_cost ?? asset.acquisitionCost ?? null,
    condition: asset.condition || "good",
    status: asset.status || "available",
    location_id: asset.location_id || asset.locationId || null,
    owning_department_id:
        asset.owning_department_id || asset.owningDepartmentId || null,
    is_shared_bookable:
        asset.is_shared_bookable ?? asset.isSharedBookable ?? false,
    qr_code: asset.qr_code || asset.qrCode || null,
    notes: asset.notes || null,
    metadata: asset.metadata || {},
    created_by: asset.created_by || asset.createdBy || null,
});

const buildAssetFilters = (filters = {}) => {
    const where = [];
    const values = [];

    const add = (column, value, operator = "=") => {
        if (value === undefined || value === null || value === "") return;
        values.push(value);
        where.push(`a.${column} ${operator} $${values.length}`);
    };

    add("status", filters.status);
    add("condition", filters.condition);
    add("category_id", filters.category_id || filters.categoryId);
    add("location_id", filters.location_id || filters.locationId);
    add("owning_department_id", filters.department_id || filters.departmentId);
    add(
        "is_shared_bookable",
        filters.is_shared_bookable ?? filters.isSharedBookable
    );

    if (filters.search) {
        values.push(`%${filters.search}%`);
        where.push(`(
            a.name ilike $${values.length}
            or a.asset_tag ilike $${values.length}
            or a.serial_number ilike $${values.length}
            or a.qr_code ilike $${values.length}
        )`);
    }

    return {
        clause: where.length ? `where ${where.join(" and ")}` : "",
        values,
    };
};

const getAllAssets = async (filters = {}) => {
    const { clause, values } = buildAssetFilters(filters);

    const query = `
        select
            a.*,
            c.name as category_name,
            l.name as location_name,
            d.name as owning_department_name
        from assets a
        left join asset_categories c on c.id = a.category_id
        left join locations l on l.id = a.location_id
        left join departments d on d.id = a.owning_department_id
        ${clause}
        order by a.created_at desc;
    `;

    const result = await pool.query(query, values);
    return result.rows;
};

const getAssetById = async (id) => {
    const query = `
        select
            a.*,
            c.name as category_name,
            l.name as location_name,
            d.name as owning_department_name
        from assets a
        left join asset_categories c on c.id = a.category_id
        left join locations l on l.id = a.location_id
        left join departments d on d.id = a.owning_department_id
        where a.id = $1;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const createAsset = async (asset) => {
    const row = toAssetRow(asset);

    const query = `
        insert into assets (
            name,
            category_id,
            serial_number,
            acquisition_date,
            acquisition_cost,
            condition,
            status,
            location_id,
            owning_department_id,
            is_shared_bookable,
            qr_code,
            notes,
            metadata,
            created_by
        )
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        returning *;
    `;

    const values = [
        row.name,
        row.category_id,
        row.serial_number,
        row.acquisition_date,
        row.acquisition_cost,
        row.condition,
        row.status,
        row.location_id,
        row.owning_department_id,
        row.is_shared_bookable,
        row.qr_code,
        row.notes,
        row.metadata,
        row.created_by,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateAsset = async (id, asset) => {
    const fieldMap = {
        name: asset.name,
        category_id: asset.category_id || asset.categoryId,
        serial_number: asset.serial_number || asset.serialNumber,
        acquisition_date: asset.acquisition_date || asset.acquisitionDate,
        acquisition_cost: asset.acquisition_cost ?? asset.acquisitionCost,
        condition: asset.condition,
        status: asset.status,
        location_id: asset.location_id || asset.locationId,
        owning_department_id:
            asset.owning_department_id || asset.owningDepartmentId,
        is_shared_bookable:
            asset.is_shared_bookable ?? asset.isSharedBookable,
        qr_code: asset.qr_code || asset.qrCode,
        notes: asset.notes,
        metadata: asset.metadata,
        retired_at: asset.retired_at || asset.retiredAt,
        disposed_at: asset.disposed_at || asset.disposedAt,
    };

    const sets = [];
    const values = [];

    Object.entries(fieldMap).forEach(([column, value]) => {
        if (value === undefined) return;
        values.push(value);
        sets.push(`${column} = $${values.length}`);
    });

    if (sets.length === 0) return getAssetById(id);

    values.push(id);

    const query = `
        update assets
        set ${sets.join(", ")}, updated_at = now()
        where id = $${values.length}
        returning *;
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteAsset = async (id) => {
    const result = await pool.query(
        "delete from assets where id = $1 returning *;",
        [id]
    );

    return result.rows[0];
};

const allocateAsset = async (assetId, allocation) => {
    const client = await pool.connect();

    try {
        await client.query("begin");

        const assetResult = await client.query(
            "select * from assets where id = $1 for update;",
            [assetId]
        );
        const asset = assetResult.rows[0];

        if (!asset) {
            const error = new Error("Asset not found.");
            error.statusCode = 404;
            throw error;
        }

        if (asset.status !== "available") {
            const error = new Error(`Asset is currently ${asset.status}.`);
            error.statusCode = 409;
            throw error;
        }

        const holderUserId =
            allocation.holder_user_id ||
            allocation.holderUserId ||
            allocation.user_id ||
            allocation.userId;
        const holderDepartmentId =
            allocation.holder_department_id ||
            allocation.holderDepartmentId ||
            allocation.department_id ||
            allocation.departmentId ||
            null;
        const holderType =
            allocation.holder_type ||
            allocation.holderType ||
            (holderDepartmentId ? "department" : "employee");

        if (holderType === "employee" && !holderUserId) {
            const error = new Error("holderUserId or userId is required.");
            error.statusCode = 400;
            throw error;
        }

        if (holderType === "department" && !holderDepartmentId) {
            const error = new Error("holderDepartmentId or departmentId is required.");
            error.statusCode = 400;
            throw error;
        }

        const allocationResult = await client.query(
            `
                insert into asset_allocations (
                    asset_id,
                    holder_type,
                    holder_user_id,
                    holder_department_id,
                    allocated_by,
                    expected_return_at,
                    checkout_condition
                )
                values ($1,$2,$3,$4,$5,$6,$7)
                returning *;
            `,
            [
                assetId,
                holderType,
                holderType === "employee" ? holderUserId : null,
                holderType === "department" ? holderDepartmentId : null,
                allocation.allocated_by || allocation.allocatedBy || null,
                allocation.expected_return_at ||
                    allocation.expectedReturnAt ||
                    null,
                asset.condition,
            ]
        );

        const updatedAsset = await client.query(
            `
                update assets
                set status = 'allocated',
                    owning_department_id = coalesce($2, owning_department_id),
                    updated_at = now()
                where id = $1
                returning *;
            `,
            [assetId, holderDepartmentId]
        );

        await client.query("commit");

        return {
            asset: updatedAsset.rows[0],
            allocation: allocationResult.rows[0],
        };
    } catch (error) {
        await client.query("rollback");
        throw error;
    } finally {
        client.release();
    }
};

const returnAsset = async (assetId, returnData = {}) => {
    const client = await pool.connect();

    try {
        await client.query("begin");

        const allocationResult = await client.query(
            `
                select *
                from asset_allocations
                where asset_id = $1 and status = 'active'
                order by allocated_at desc
                limit 1
                for update;
            `,
            [assetId]
        );

        const allocation = allocationResult.rows[0];

        if (!allocation) {
            const error = new Error("No active allocation found for this asset.");
            error.statusCode = 404;
            throw error;
        }

        const returnedAllocation = await client.query(
            `
                update asset_allocations
                set status = 'returned',
                    returned_at = now(),
                    return_received_by = $2,
                    checkin_condition = coalesce($3, checkout_condition),
                    checkin_notes = $4,
                    updated_at = now()
                where id = $1
                returning *;
            `,
            [
                allocation.id,
                returnData.return_received_by ||
                    returnData.returnReceivedBy ||
                    null,
                returnData.checkin_condition ||
                    returnData.checkinCondition ||
                    null,
                returnData.checkin_notes || returnData.checkinNotes || null,
            ]
        );

        const updatedAsset = await client.query(
            `
                update assets
                set status = 'available',
                    condition = coalesce($2, condition),
                    updated_at = now()
                where id = $1
                returning *;
            `,
            [
                assetId,
                returnData.checkin_condition ||
                    returnData.checkinCondition ||
                    null,
            ]
        );

        await client.query("commit");

        return {
            asset: updatedAsset.rows[0],
            allocation: returnedAllocation.rows[0],
        };
    } catch (error) {
        await client.query("rollback");
        throw error;
    } finally {
        client.release();
    }
};

const transferAsset = async (assetId, transfer) => {
    const client = await pool.connect();

    try {
        await client.query("begin");

        const assetResult = await client.query(
            "select * from assets where id = $1 for update;",
            [assetId]
        );
        const asset = assetResult.rows[0];

        if (!asset) {
            const error = new Error("Asset not found.");
            error.statusCode = 404;
            throw error;
        }

        const allocationResult = await client.query(
            `
                select *
                from asset_allocations
                where asset_id = $1 and status = 'active'
                order by allocated_at desc
                limit 1;
            `,
            [assetId]
        );

        const targetUserId =
            transfer.target_user_id ||
            transfer.targetUserId ||
            transfer.user_id ||
            transfer.userId ||
            null;
        const targetDepartmentId =
            transfer.target_department_id ||
            transfer.targetDepartmentId ||
            transfer.department_id ||
            transfer.departmentId ||
            null;
        const targetHolderType =
            transfer.target_holder_type ||
            transfer.targetHolderType ||
            (targetDepartmentId ? "department" : "employee");
        const requestedBy = transfer.requested_by || transfer.requestedBy;

        if (targetHolderType === "employee" && !targetUserId) {
            const error = new Error("targetUserId or userId is required.");
            error.statusCode = 400;
            throw error;
        }

        if (targetHolderType === "department" && !targetDepartmentId) {
            const error = new Error("targetDepartmentId or departmentId is required.");
            error.statusCode = 400;
            throw error;
        }

        if (!requestedBy) {
            const error = new Error("requestedBy is required.");
            error.statusCode = 400;
            throw error;
        }

        const transferResult = await client.query(
            `
                insert into asset_transfer_requests (
                    asset_id,
                    from_allocation_id,
                    requested_by,
                    target_holder_type,
                    target_user_id,
                    target_department_id,
                    reason
                )
                values ($1,$2,$3,$4,$5,$6,$7)
                returning *;
            `,
            [
                assetId,
                transfer.from_allocation_id ||
                    transfer.fromAllocationId ||
                    allocationResult.rows[0]?.id ||
                    null,
                requestedBy,
                targetHolderType,
                targetHolderType === "employee" ? targetUserId : null,
                targetHolderType === "department" ? targetDepartmentId : null,
                transfer.reason || null,
            ]
        );

        await client.query("commit");

        return transferResult.rows[0];
    } catch (error) {
        await client.query("rollback");
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    allocateAsset,
    createAsset,
    deleteAsset,
    getAllAssets,
    getAssetById,
    returnAsset,
    transferAsset,
    updateAsset,
};
