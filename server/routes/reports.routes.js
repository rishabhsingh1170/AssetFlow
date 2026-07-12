const express = require("express");
const router = express.Router();

const reportController = require("../controller/report.controller");

router.get("/assets", reportController.getAssetReport);
router.get("/bookings", reportController.getBookingReport);
router.get("/maintenance", reportController.getMaintenanceReport);

module.exports = router;
