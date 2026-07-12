const bookingService = require("../services/booking.service");

const sendError = (res, error, fallbackMessage) =>
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || fallbackMessage,
    });

const getAllBookings = async (req, res) => {
    try {
        const bookings = await bookingService.getAllBookings(req.query);
        return res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        return sendError(res, error, "Failed to fetch bookings.");
    }
};

const getBookingById = async (req, res) => {
    try {
        const booking = await bookingService.getBookingById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }

        return res.status(200).json({ success: true, data: booking });
    } catch (error) {
        return sendError(res, error, "Failed to fetch booking.");
    }
};

const createBooking = async (req, res) => {
    try {
        const booking = await bookingService.createBooking({
            ...req.body,
            bookedBy: req.user?.id || req.body.bookedBy,
        });

        return res.status(201).json({
            success: true,
            message: "Booking request created successfully.",
            data: booking,
        });
    } catch (error) {
        return sendError(res, error, "Failed to create booking.");
    }
};

const updateBooking = async (req, res) => {
    try {
        const booking = await bookingService.updateBooking(req.params.id, req.body);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Booking updated successfully.",
            data: booking,
        });
    } catch (error) {
        return sendError(res, error, "Failed to update booking.");
    }
};

const deleteBooking = async (req, res) => {
    try {
        const booking = await bookingService.deleteBooking(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Booking deleted successfully.",
            data: booking,
        });
    } catch (error) {
        return sendError(res, error, "Failed to delete booking.");
    }
};

module.exports = {
    createBooking,
    deleteBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
};
