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
            id: [required("Location ID"), uuid("Location ID")],
        },
    },
};

const createLocation = {
    body: {
        fields: {
            name: [required("Location name"), string("Location name", { min: 2, max: 120 })],
            code: [required("Location code"), string("Location code", { min: 2, max: 40 })],
            departmentId: [optional(uuid("Department ID"))],
            address: [optional(string("Address", { max: 500 }))],
            status: [optional(oneOf(statuses, "Status"))],
        },
    },
};

const updateLocation = {
    params: idParam.params,
    body: {
        fields: {
            name: [optional(string("Location name", { min: 2, max: 120 }))],
            code: [optional(string("Location code", { min: 2, max: 40 }))],
            departmentId: [optional(uuid("Department ID"))],
            address: [optional(string("Address", { max: 500 }))],
            status: [optional(oneOf(statuses, "Status"))],
        },
        rules: [atLeastOne(["name", "code", "departmentId", "address", "status"])],
    },
};

module.exports = {
    createLocation,
    idParam,
    updateLocation,
};
