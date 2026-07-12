const assetService = require("../services/asset.service");

const sendError = (res, error, fallbackMessage) => {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: error.message || fallbackMessage,
    });
};

const getAllAssets = async (req, res) => {
    try {
        const assets = await assetService.getAllAssets(req.query);

        return res.status(200).json({
            success: true,
            message: "Assets fetched successfully.",
            data: assets,
        });
    } catch (error) {
        return sendError(res, error, "Failed to fetch assets.");
    }
};

const getAssetById = async (req, res) => {
    try {
        const asset = await assetService.getAssetById(req.params.id);

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: asset,
        });
    } catch (error) {
        return sendError(res, error, "Failed to fetch asset.");
    }
};

const createAsset = async (req, res) => {
    try {
        const asset = await assetService.createAsset({
            ...req.body,
            createdBy: req.user?.id || req.body.createdBy,
        });

        return res.status(201).json({
            success: true,
            message: "Asset created successfully.",
            data: asset,
        });
    } catch (error) {
        return sendError(res, error, "Failed to create asset.");
    }
};

const updateAsset = async (req, res) => {
    try {
        const asset = await assetService.updateAsset(req.params.id, req.body);

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Asset updated successfully.",
            data: asset,
        });
    } catch (error) {
        return sendError(res, error, "Failed to update asset.");
    }
};

const deleteAsset = async (req, res) => {
    try {
        const asset = await assetService.deleteAsset(req.params.id);

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Asset deleted successfully.",
            data: asset,
        });
    } catch (error) {
        return sendError(res, error, "Failed to delete asset.");
    }
};

const allocateAsset = async (req, res) => {
    try {
        const result = await assetService.allocateAsset(req.params.id, {
            ...req.body,
            allocatedBy: req.user?.id || req.body.allocatedBy,
        });

        return res.status(201).json({
            success: true,
            message: "Asset allocated successfully.",
            data: result,
        });
    } catch (error) {
        return sendError(res, error, "Failed to allocate asset.");
    }
};

const returnAsset = async (req, res) => {
    try {
        const result = await assetService.returnAsset(req.params.id, {
            ...req.body,
            returnReceivedBy: req.user?.id || req.body.returnReceivedBy,
        });

        return res.status(200).json({
            success: true,
            message: "Asset returned successfully.",
            data: result,
        });
    } catch (error) {
        return sendError(res, error, "Failed to return asset.");
    }
};

const transferAsset = async (req, res) => {
    try {
        const transfer = await assetService.transferAsset(req.params.id, {
            ...req.body,
            requestedBy: req.user?.id || req.body.requestedBy,
        });

        return res.status(201).json({
            success: true,
            message: "Asset transfer request created successfully.",
            data: transfer,
        });
    } catch (error) {
        return sendError(res, error, "Failed to create transfer request.");
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
