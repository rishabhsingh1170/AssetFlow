const {
    array,
    atLeastOne,
    number,
    oneOf,
    optional,
    required,
    string,
    uuid,
} = require("./common.validation");

const maintenancePriorities = ["low", "medium", "high", "critical"];
const maintenanceStatuses = [
    "pending",
    "approved",
    "rejected",
    "technician_assigned",
    "in_progress",
    "resolved",
    "cancelled",
];

const idParam = {
    params: {
        fields: {
            id: [required("Maintenance request ID"), uuid("Maintenance request ID")],
        },
    },
};

const listMaintenanceRequests = {
    query: {
        fields: {
            assetId: [optional(uuid("Asset ID"))],
            requestedBy: [optional(uuid("Requested by user ID"))],
            technicianUserId: [optional(uuid("Technician user ID"))],
            status: [optional(oneOf(maintenanceStatuses, "Maintenance status"))],
            priority: [optional(oneOf(maintenancePriorities, "Priority"))],
        },
    },
};

const createMaintenanceRequest = {
    body: {
        fields: {
            assetId: [required("Asset ID"), uuid("Asset ID")],
            requestedBy: [optional(uuid("Requested by user ID"))],
            issueDescription: [
                required("Issue description"),
                string("Issue description", { min: 5, max: 2000 }),
            ],
            priority: [optional(oneOf(maintenancePriorities, "Priority"))],
            attachmentIds: [optional(array("Attachment IDs"))],
        },
    },
};

const reviewMaintenanceRequest = {
    params: idParam.params,
    body: {
        fields: {
            status: [required("Review status"), oneOf(["approved", "rejected"], "Review status")],
            reviewedBy: [optional(uuid("Reviewed by user ID"))],
            rejectionReason: [optional(string("Rejection reason", { max: 1000 }))],
        },
    },
};

const assignTechnician = {
    params: idParam.params,
    body: {
        fields: {
            technicianUserId: [required("Technician user ID"), uuid("Technician user ID")],
            assignedBy: [optional(uuid("Assigned by user ID"))],
        },
    },
};

const updateMaintenanceProgress = {
    params: idParam.params,
    body: {
        fields: {
            status: [
                required("Maintenance status"),
                oneOf(["in_progress", "resolved", "cancelled"], "Maintenance status"),
            ],
            resolutionNotes: [optional(string("Resolution notes", { max: 2000 }))],
            estimatedCost: [optional(number("Estimated cost", { min: 0 }))],
            actualCost: [optional(number("Actual cost", { min: 0 }))],
        },
    },
};

const updateMaintenanceRequest = {
    params: idParam.params,
    body: {
        fields: {
            issueDescription: [optional(string("Issue description", { min: 5, max: 2000 }))],
            priority: [optional(oneOf(maintenancePriorities, "Priority"))],
            status: [optional(oneOf(maintenanceStatuses, "Maintenance status"))],
            technicianUserId: [optional(uuid("Technician user ID"))],
            resolutionNotes: [optional(string("Resolution notes", { max: 2000 }))],
            estimatedCost: [optional(number("Estimated cost", { min: 0 }))],
            actualCost: [optional(number("Actual cost", { min: 0 }))],
        },
        rules: [
            atLeastOne([
                "issueDescription",
                "priority",
                "status",
                "technicianUserId",
                "resolutionNotes",
                "estimatedCost",
                "actualCost",
            ]),
        ],
    },
};

module.exports = {
    assignTechnician,
    createMaintenanceRequest,
    idParam,
    listMaintenanceRequests,
    maintenancePriorities,
    maintenanceStatuses,
    reviewMaintenanceRequest,
    updateMaintenanceProgress,
    updateMaintenanceRequest,
};
