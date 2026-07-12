const bookingModel = require("../models/Booking");

const getAllBookings = async (filters) => bookingModel.getAllBookings(filters);

const getBookingById = async (id) => bookingModel.getBookingById(id);

const createBooking = async (bookingData) =>
    bookingModel.createBooking(bookingData);

const updateBooking = async (id, bookingData) =>
    bookingModel.updateBooking(id, bookingData);

const deleteBooking = async (id) => bookingModel.deleteBooking(id);

module.exports = {
    createBooking,
    deleteBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
};
