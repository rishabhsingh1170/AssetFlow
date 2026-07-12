const maintenanceModel = require("../models/Maintenance");

const getAllMaintenanceRequests = async (filters) =>
    maintenanceModel.getAllMaintenanceRequests(filters);

const getMaintenanceRequestById = async (id) =>
    maintenanceModel.getMaintenanceRequestById(id);

const createMaintenanceRequest = async (maintenanceData) =>
    maintenanceModel.createMaintenanceRequest(maintenanceData);

const updateMaintenanceRequest = async (id, maintenanceData) =>
    maintenanceModel.updateMaintenanceRequest(id, maintenanceData);

const deleteMaintenanceRequest = async (id) =>
    maintenanceModel.deleteMaintenanceRequest(id);

module.exports = {
    createMaintenanceRequest,
    deleteMaintenanceRequest,
    getAllMaintenanceRequests,
    getMaintenanceRequestById,
    updateMaintenanceRequest,
};
