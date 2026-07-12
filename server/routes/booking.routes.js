const express = require("express");
const router = express.Router();

const bookingController = require("../controller/booking.controller");
const validate = require("../middlewares/validate.middleware");
const { booking } = require("../validations");

router.get("/", validate(booking.listBookings), bookingController.getAllBookings);
router.get("/:id", validate(booking.idParam), bookingController.getBookingById);
router.post("/", validate(booking.createBooking), bookingController.createBooking);
router.put("/:id", validate(booking.updateBooking), bookingController.updateBooking);
router.delete("/:id", validate(booking.idParam), bookingController.deleteBooking);

module.exports = router;
