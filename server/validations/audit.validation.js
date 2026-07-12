const {
    array,
    atLeastOne,
    date,
    oneOf,
    optional,
    required,
    string,
    uuid,
} = require("./common.validation");

const auditCycleStatuses = ["draft", "scheduled", "in_progress", "closed", "cancelled"];
const auditItemStatuses = ["pending", "verified", "missing", "damaged"];

const idParam = {
    params: {
        fields: {
            id: [required("Audit cycle ID"), uuid("Audit cycle ID")],
        },
    },
};

const createAuditCycle = {
    body: {
        fields: {
            name: [required("Audit cycle name"), string("Audit cycle name", { min: 2, max: 160 })],
            scopeDepartmentId: [optional(uuid("Scope department ID"))],
            scopeLocationId: [optional(uuid("Scope location ID"))],
            startsOn: [required("Start date"), date("Start date")],
            endsOn: [required("End date"), date("End date")],
            auditorUserIds: [optional(array("Auditor user IDs"))],
        },
        rules: [
            (data) => {
                if (data.startsOn && data.endsOn && new Date(data.endsOn) < new Date(data.startsOn)) {
                    return "End date must be on or after start date.";
                }
                return null;
            },
        ],
    },
};

const updateAuditCycle = {
    params: idParam.params,
    body: {
        fields: {
            name: [optional(string("Audit cycle name", { min: 2, max: 160 }))],
            scopeDepartmentId: [optional(uuid("Scope department ID"))],
            scopeLocationId: [optional(uuid("Scope location ID"))],
            startsOn: [optional(date("Start date"))],
            endsOn: [optional(date("End date"))],
            status: [optional(oneOf(auditCycleStatuses, "Audit cycle status"))],
            auditorUserIds: [optional(array("Auditor user IDs"))],
        },
        rules: [
            atLeastOne([
                "name",
                "scopeDepartmentId",
                "scopeLocationId",
                "startsOn",
                "endsOn",
                "status",
                "auditorUserIds",
            ]),
        ],
    },
};

const markAuditItem = {
    params: {
        fields: {
            id: [required("Audit item ID"), uuid("Audit item ID")],
        },
    },
    body: {
        fields: {
            status: [required("Audit item status"), oneOf(auditItemStatuses, "Audit item status")],
            auditorUserId: [optional(uuid("Auditor user ID"))],
            notes: [optional(string("Notes", { max: 2000 }))],
        },
    },
};

const closeAuditCycle = {
    params: idParam.params,
    body: {
        fields: {
            closedBy: [optional(uuid("Closed by user ID"))],
            resolutionNotes: [optional(string("Resolution notes", { max: 2000 }))],
        },
    },
};

module.exports = {
    auditCycleStatuses,
    auditItemStatuses,
    closeAuditCycle,
    createAuditCycle,
    idParam,
    markAuditItem,
    updateAuditCycle,
};
