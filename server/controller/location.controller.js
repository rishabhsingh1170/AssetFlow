const locationService = require("../services/location.service");

const sendError = (res, error, fallbackMessage) =>
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || fallbackMessage,
    });

const getAllLocations = async (req, res) => {
    try {
        const locations = await locationService.getAllLocations();

        return res.status(200).json({
            success: true,
            message: "Locations fetched successfully.",
            data: locations,
        });
    } catch (error) {
        return sendError(res, error, "Failed to fetch locations.");
    }
};

const getLocationById = async (req, res) => {
    try {
        const location = await locationService.getLocationById(req.params.id);

        if (!location) {
            return res.status(404).json({
                success: false,
                message: "Location not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: location,
        });
    } catch (error) {
        return sendError(res, error, "Failed to fetch location.");
    }
};

const createLocation = async (req, res) => {
    try {
        const location = await locationService.createLocation(req.body);

        return res.status(201).json({
            success: true,
            message: "Location created successfully.",
            data: location,
        });
    } catch (error) {
        return sendError(res, error, "Failed to create location.");
    }
};

const updateLocation = async (req, res) => {
    try {
        const location = await locationService.updateLocation(
            req.params.id,
            req.body
        );

        if (!location) {
            return res.status(404).json({
                success: false,
                message: "Location not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Location updated successfully.",
            data: location,
        });
    } catch (error) {
        return sendError(res, error, "Failed to update location.");
    }
};

const deleteLocation = async (req, res) => {
    try {
        const location = await locationService.deleteLocation(req.params.id);

        if (!location) {
            return res.status(404).json({
                success: false,
                message: "Location not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Location deleted successfully.",
            data: location,
        });
    } catch (error) {
        return sendError(res, error, "Failed to delete location.");
    }
};

module.exports = {
    createLocation,
    deleteLocation,
    getAllLocations,
    getLocationById,
    updateLocation,
};
