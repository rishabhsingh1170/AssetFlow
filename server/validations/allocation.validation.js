const {
    afterField,
    atLeastOne,
    dateTime,
    exactlyOneGroup,
    oneOf,
    optional,
    required,
    string,
    uuid,
} = require("./common.validation");

const holderTypes = ["employee", "department"];
const allocationStatuses = ["active", "returned", "cancelled"];
const transferStatuses = ["requested", "approved", "rejected", "cancelled"];
const conditions = ["new", "good", "fair", "poor", "damaged"];

const idParam = {
    params: {
        fields: {
            id: [required("Allocation ID"), uuid("Allocation ID")],
        },
    },
};

const createAllocation = {
    body: {
        fields: {
            assetId: [required("Asset ID"), uuid("Asset ID")],
            holderType: [required("Holder type"), oneOf(holderTypes, "Holder type")],
            holderUserId: [optional(uuid("Holder user ID"))],
            holderDepartmentId: [optional(uuid("Holder department ID"))],
            allocatedBy: [optional(uuid("Allocated by user ID"))],
            expectedReturnAt: [optional(dateTime("Expected return time"))],
        },
        rules: [
            exactlyOneGroup([["holderUserId"], ["holderDepartmentId"]], "Allocation"),
            (data) => {
                if (data.holderType === "employee" && !data.holderUserId) {
                    return "Employee allocation requires holderUserId.";
                }
                if (data.holderType === "department" && !data.holderDepartmentId) {
                    return "Department allocation requires holderDepartmentId.";
                }
                return null;
            },
        ],
    },
};

const returnAllocation = {
    params: idParam.params,
    body: {
        fields: {
            returnReceivedBy: [optional(uuid("Return receiver user ID"))],
            checkinCondition: [required("Check-in condition"), oneOf(conditions, "Check-in condition")],
            checkinNotes: [optional(string("Check-in notes", { max: 2000 }))],
        },
    },
};

const createTransferRequest = {
    body: {
        fields: {
            assetId: [required("Asset ID"), uuid("Asset ID")],
            fromAllocationId: [optional(uuid("From allocation ID"))],
            requestedBy: [optional(uuid("Requested by user ID"))],
            targetHolderType: [required("Target holder type"), oneOf(holderTypes, "Target holder type")],
            targetUserId: [optional(uuid("Target user ID"))],
            targetDepartmentId: [optional(uuid("Target department ID"))],
            reason: [optional(string("Reason", { max: 1000 }))],
        },
        rules: [
            exactlyOneGroup([["targetUserId"], ["targetDepartmentId"]], "Transfer request"),
            (data) => {
                if (data.targetHolderType === "employee" && !data.targetUserId) {
                    return "Employee transfer requires targetUserId.";
                }
                if (data.targetHolderType === "department" && !data.targetDepartmentId) {
                    return "Department transfer requires targetDepartmentId.";
                }
                return null;
            },
        ],
    },
};

const reviewTransferRequest = {
    params: {
        fields: {
            id: [required("Transfer request ID"), uuid("Transfer request ID")],
        },
    },
    body: {
        fields: {
            status: [required("Transfer status"), oneOf(["approved", "rejected"], "Transfer status")],
            reviewedBy: [optional(uuid("Reviewed by user ID"))],
            expectedReturnAt: [optional(dateTime("Expected return time"))],
            reason: [optional(string("Reason", { max: 1000 }))],
        },
    },
};

const listAllocations = {
    query: {
        fields: {
            assetId: [optional(uuid("Asset ID"))],
            holderUserId: [optional(uuid("Holder user ID"))],
            holderDepartmentId: [optional(uuid("Holder department ID"))],
            status: [optional(oneOf(allocationStatuses, "Allocation status"))],
            dueAfter: [optional(dateTime("Due after"))],
            dueBefore: [optional(dateTime("Due before")), afterField("dueAfter", "Due before")],
        },
    },
};

const updateAllocation = {
    params: idParam.params,
    body: {
        fields: {
            expectedReturnAt: [optional(dateTime("Expected return time"))],
            status: [optional(oneOf(allocationStatuses, "Allocation status"))],
            checkinNotes: [optional(string("Check-in notes", { max: 2000 }))],
        },
        rules: [atLeastOne(["expectedReturnAt", "status", "checkinNotes"])],
    },
};

module.exports = {
    allocationStatuses,
    createAllocation,
    createTransferRequest,
    holderTypes,
    idParam,
    listAllocations,
    returnAllocation,
    reviewTransferRequest,
    transferStatuses,
    updateAllocation,
};
