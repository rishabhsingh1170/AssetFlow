const isEmpty = (value) =>
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "");

const optional = (rule) => (value, data) => {
    if (isEmpty(value)) return null;
    return rule(value, data);
};

const required = (label = "Field") => (value) => {
    if (isEmpty(value)) return `${label} is required.`;
    return null;
};

const string = (label = "Field", options = {}) => (value) => {
    if (isEmpty(value)) return null;
    if (typeof value !== "string") return `${label} must be a string.`;

    const trimmed = value.trim();
    if (options.min && trimmed.length < options.min) {
        return `${label} must be at least ${options.min} characters.`;
    }

    if (options.max && trimmed.length > options.max) {
        return `${label} must be at most ${options.max} characters.`;
    }

    return null;
};

const email = (label = "Email") => (value) => {
    if (isEmpty(value)) return null;
    if (typeof value !== "string") return `${label} must be a string.`;

    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(value.trim().toLowerCase())) {
        return `${label} must be a valid email address.`;
    }

    return null;
};

const uuid = (label = "ID") => (value) => {
    if (isEmpty(value)) return null;
    if (typeof value !== "string") return `${label} must be a UUID.`;

    const pattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!pattern.test(value)) return `${label} must be a valid UUID.`;
    return null;
};

const oneOf = (values, label = "Field") => (value) => {
    if (isEmpty(value)) return null;
    if (!values.includes(value)) {
        return `${label} must be one of: ${values.join(", ")}.`;
    }
    return null;
};

const boolean = (label = "Field") => (value) => {
    if (isEmpty(value)) return null;
    if (typeof value !== "boolean") return `${label} must be a boolean.`;
    return null;
};

const number = (label = "Field", options = {}) => (value) => {
    if (isEmpty(value)) return null;
    if (typeof value !== "number" || Number.isNaN(value)) {
        return `${label} must be a number.`;
    }

    if (options.min !== undefined && value < options.min) {
        return `${label} must be greater than or equal to ${options.min}.`;
    }

    return null;
};

const date = (label = "Date") => (value) => {
    if (isEmpty(value)) return null;
    if (Number.isNaN(Date.parse(value))) return `${label} must be a valid date.`;
    return null;
};

const dateTime = (label = "Date/time") => (value) => {
    if (isEmpty(value)) return null;
    if (Number.isNaN(Date.parse(value))) {
        return `${label} must be a valid date/time.`;
    }
    return null;
};

const object = (label = "Field") => (value) => {
    if (isEmpty(value)) return null;
    if (typeof value !== "object" || Array.isArray(value)) {
        return `${label} must be an object.`;
    }
    return null;
};

const array = (label = "Field") => (value) => {
    if (isEmpty(value)) return null;
    if (!Array.isArray(value)) return `${label} must be an array.`;
    return null;
};

const atLeastOne = (fields, label = "Payload") => (data) => {
    const hasValue = fields.some((field) => !isEmpty(data[field]));
    if (!hasValue) return `${label} must include at least one updatable field.`;
    return null;
};

const exactlyOneGroup = (groups, label = "Payload") => (data) => {
    const matched = groups.filter((group) =>
        group.every((field) => !isEmpty(data[field]))
    );

    if (matched.length !== 1) {
        return `${label} must include exactly one valid target.`;
    }

    return null;
};

const afterField = (startField, label = "End date") => (value, data) => {
    if (isEmpty(value) || isEmpty(data[startField])) return null;
    if (new Date(value) <= new Date(data[startField])) {
        return `${label} must be after ${startField}.`;
    }
    return null;
};

module.exports = {
    afterField,
    array,
    atLeastOne,
    boolean,
    date,
    dateTime,
    email,
    exactlyOneGroup,
    isEmpty,
    number,
    object,
    oneOf,
    optional,
    required,
    string,
    uuid,
};
