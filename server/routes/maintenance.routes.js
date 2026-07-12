const express = require("express");
const router = express.Router();

const maintenanceController = require("../controller/maintenance.controller");
const validate = require("../middlewares/validate.middleware");
const { maintenance } = require("../validations");

router.get(
    "/",
    validate(maintenance.listMaintenanceRequests),
    maintenanceController.getAllMaintenanceRequests
);

router.get(
    "/:id",
    validate(maintenance.idParam),
    maintenanceController.getMaintenanceRequestById
);

router.post(
    "/",
    validate(maintenance.createMaintenanceRequest),
    maintenanceController.createMaintenanceRequest
);

router.put(
    "/:id",
    validate(maintenance.updateMaintenanceRequest),
    maintenanceController.updateMaintenanceRequest
);

router.delete(
    "/:id",
    validate(maintenance.idParam),
    maintenanceController.deleteMaintenanceRequest
);

module.exports = router;
