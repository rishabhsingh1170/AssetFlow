const {
    atLeastOne,
    oneOf,
    optional,
    required,
    string,
    uuid,
} = require("./common.validation");

const statuses = ["active", "inactive"];

const idParam = {
    params: {
        fields: {
            id: [required("Department ID"), uuid("Department ID")],
        },
    },
};

const createDepartment = {
    body: {
        fields: {
            name: [required("Department name"), string("Department name", { min: 2, max: 120 })],
            code: [required("Department code"), string("Department code", { min: 2, max: 40 })],
            parentDepartmentId: [optional(uuid("Parent department ID"))],
            headUserId: [optional(uuid("Department head user ID"))],
            status: [optional(oneOf(statuses, "Status"))],
        },
    },
};

const updateDepartment = {
    params: idParam.params,
    body: {
        fields: {
            name: [optional(string("Department name", { min: 2, max: 120 }))],
            code: [optional(string("Department code", { min: 2, max: 40 }))],
            parentDepartmentId: [optional(uuid("Parent department ID"))],
            headUserId: [optional(uuid("Department head user ID"))],
            status: [optional(oneOf(statuses, "Status"))],
        },
        rules: [atLeastOne(["name", "code", "parentDepartmentId", "headUserId", "status"])],
    },
};

module.exports = {
    createDepartment,
    idParam,
    updateDepartment,
};
