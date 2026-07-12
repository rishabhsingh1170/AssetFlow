const {
    atLeastOne,
    email,
    oneOf,
    optional,
    required,
    string,
    uuid,
} = require("./common.validation");

const roles = ["admin", "asset_manager", "department_head", "employee"];
const statuses = ["active", "inactive"];

const signup = {
    body: {
        fields: {
            fullName: [required("Full name"), string("Full name", { min: 2, max: 120 })],
            email: [required("Email"), email()],
            password: [required("Password"), string("Password", { min: 8, max: 128 })],
            departmentId: [optional(uuid("Department ID"))],
            phone: [optional(string("Phone", { max: 30 }))],
            employeeCode: [optional(string("Employee code", { max: 50 }))],
        },
    },
};

const login = {
    body: {
        fields: {
            email: [required("Email"), email()],
            password: [required("Password"), string("Password", { min: 1, max: 128 })],
        },
    },
};

const forgotPassword = {
    body: {
        fields: {
            email: [required("Email"), email()],
        },
    },
};

const resetPassword = {
    body: {
        fields: {
            token: [required("Reset token"), string("Reset token", { min: 10 })],
            password: [required("Password"), string("Password", { min: 8, max: 128 })],
        },
    },
};

const updateProfile = {
    body: {
        fields: {
            fullName: [optional(string("Full name", { min: 2, max: 120 }))],
            departmentId: [optional(uuid("Department ID"))],
            phone: [optional(string("Phone", { max: 30 }))],
            employeeCode: [optional(string("Employee code", { max: 50 }))],
            status: [optional(oneOf(statuses, "Status"))],
        },
        rules: [atLeastOne(["fullName", "departmentId", "phone", "employeeCode", "status"])],
    },
};

const promoteUser = {
    params: {
        fields: {
            id: [required("User ID"), uuid("User ID")],
        },
    },
    body: {
        fields: {
            role: [required("Role"), oneOf(roles, "Role")],
        },
    },
};

module.exports = {
    forgotPassword,
    login,
    promoteUser,
    resetPassword,
    signup,
    updateProfile,
};
