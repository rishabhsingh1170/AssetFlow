const express = require("express");
const router = express.Router();

const locationController = require("../controller/location.controller");
const validate = require("../middlewares/validate.middleware");
const location = require("../validations/location.validation");

router.get("/", locationController.getAllLocations);

router.get("/:id", validate(location.idParam), locationController.getLocationById);

router.post("/", validate(location.createLocation), locationController.createLocation);

router.put(
    "/:id",
    validate(location.updateLocation),
    locationController.updateLocation
);

router.delete("/:id", validate(location.idParam), locationController.deleteLocation);

module.exports = router;
