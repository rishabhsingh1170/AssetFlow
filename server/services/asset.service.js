const assetModel = require("../models/Asset");

const getAllAssets = async (filters) => assetModel.getAllAssets(filters);

const getAssetById = async (id) => assetModel.getAssetById(id);

const createAsset = async (assetData) => assetModel.createAsset(assetData);

const updateAsset = async (id, assetData) =>
    assetModel.updateAsset(id, assetData);

const deleteAsset = async (id) => assetModel.deleteAsset(id);

const allocateAsset = async (id, allocationData) =>
    assetModel.allocateAsset(id, allocationData);

const returnAsset = async (id, returnData) =>
    assetModel.returnAsset(id, returnData);

const transferAsset = async (id, transferData) =>
    assetModel.transferAsset(id, transferData);

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
