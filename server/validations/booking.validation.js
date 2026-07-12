const {
    afterField,
    atLeastOne,
    dateTime,
    oneOf,
    optional,
    required,
    string,
    uuid,
} = require("./common.validation");

const bookingStatuses = ["upcoming", "ongoing", "completed", "cancelled"];

const idParam = {
    params: {
        fields: {
            id: [required("Booking ID"), uuid("Booking ID")],
        },
    },
};

const listBookings = {
    query: {
        fields: {
            assetId: [optional(uuid("Asset ID"))],
            bookedBy: [optional(uuid("Booked by user ID"))],
            departmentId: [optional(uuid("Department ID"))],
            status: [optional(oneOf(bookingStatuses, "Booking status"))],
            startsAfter: [optional(dateTime("Starts after"))],
            endsBefore: [optional(dateTime("Ends before"))],
        },
    },
};

const createBooking = {
    body: {
        fields: {
            assetId: [required("Asset ID"), uuid("Asset ID")],
            bookedBy: [optional(uuid("Booked by user ID"))],
            departmentId: [optional(uuid("Department ID"))],
            startsAt: [required("Start time"), dateTime("Start time")],
            endsAt: [
                required("End time"),
                dateTime("End time"),
                afterField("startsAt", "End time"),
            ],
            purpose: [optional(string("Purpose", { max: 500 }))],
        },
    },
};

const rescheduleBooking = {
    params: idParam.params,
    body: {
        fields: {
            startsAt: [required("Start time"), dateTime("Start time")],
            endsAt: [
                required("End time"),
                dateTime("End time"),
                afterField("startsAt", "End time"),
            ],
        },
    },
};

const updateBooking = {
    params: idParam.params,
    body: {
        fields: {
            status: [optional(oneOf(bookingStatuses, "Booking status"))],
            purpose: [optional(string("Purpose", { max: 500 }))],
            cancelledBy: [optional(uuid("Cancelled by user ID"))],
        },
        rules: [atLeastOne(["status", "purpose", "cancelledBy"])],
    },
};

module.exports = {
    bookingStatuses,
    createBooking,
    idParam,
    listBookings,
    rescheduleBooking,
    updateBooking,
};
