const maintenanceService = require("../services/maintenance.service");

const sendError = (res, error, fallbackMessage) =>
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || fallbackMessage,
    });

const getAllMaintenanceRequests = async (req, res) => {
    try {
        const requests = await maintenanceService.getAllMaintenanceRequests(req.query);
        return res.status(200).json({ success: true, data: requests });
    } catch (error) {
        return sendError(res, error, "Failed to fetch maintenance requests.");
    }
};

const getMaintenanceRequestById = async (req, res) => {
    try {
        const request = await maintenanceService.getMaintenanceRequestById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Maintenance request not found.",
            });
        }

        return res.status(200).json({ success: true, data: request });
    } catch (error) {
        return sendError(res, error, "Failed to fetch maintenance request.");
    }
};

const createMaintenanceRequest = async (req, res) => {
    try {
        const request = await maintenanceService.createMaintenanceRequest({
            ...req.body,
            requestedBy: req.user?.id || req.body.requestedBy,
        });

        return res.status(201).json({
            success: true,
            message: "Maintenance request created successfully.",
            data: request,
        });
    } catch (error) {
        return sendError(res, error, "Failed to create maintenance request.");
    }
};

const updateMaintenanceRequest = async (req, res) => {
    try {
        const request = await maintenanceService.updateMaintenanceRequest(
            req.params.id,
            req.body
        );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Maintenance request not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Maintenance request updated successfully.",
            data: request,
        });
    } catch (error) {
        return sendError(res, error, "Failed to update maintenance request.");
    }
};

const deleteMaintenanceRequest = async (req, res) => {
    try {
        const request = await maintenanceService.deleteMaintenanceRequest(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Maintenance request not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Maintenance request deleted successfully.",
            data: request,
        });
    } catch (error) {
        return sendError(res, error, "Failed to delete maintenance request.");
    }
};

module.exports = {
    createMaintenanceRequest,
    deleteMaintenanceRequest,
    getAllMaintenanceRequests,
    getMaintenanceRequestById,
    updateMaintenanceRequest,
};
