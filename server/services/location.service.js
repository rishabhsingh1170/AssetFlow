const locationModel = require("../models/Location");

const getAllLocations = async () => locationModel.getAllLocations();

const getLocationById = async (id) => locationModel.getLocationById(id);

const createLocation = async (locationData) =>
    locationModel.createLocation(locationData);

const updateLocation = async (id, locationData) =>
    locationModel.updateLocation(id, locationData);

const deleteLocation = async (id) => locationModel.deleteLocation(id);

module.exports = {
    createLocation,
    deleteLocation,
    getAllLocations,
    getLocationById,
    updateLocation,
};
