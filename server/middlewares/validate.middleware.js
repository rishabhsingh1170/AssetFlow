const getSection = (req, section) => {
    if (section === "body") return req.body || {};
    if (section === "params") return req.params || {};
    if (section === "query") return req.query || {};
    return {};
};

const validateSection = (schema, data, section) => {
    const errors = [];
    const fieldRules = schema.fields || {};

    Object.entries(fieldRules).forEach(([field, rules]) => {
        const value = data[field];

        rules.forEach((rule) => {
            const message = rule(value, data);

            if (message) {
                errors.push({
                    field: `${section}.${field}`,
                    message,
                });
            }
        });
    });

    (schema.rules || []).forEach((rule) => {
        const message = rule(data);

        if (message) {
            errors.push({
                field: section,
                message,
            });
        }
    });

    return errors;
};

const validate = (schema) => (req, res, next) => {
    const errors = [];

    ["params", "query", "body"].forEach((section) => {
        if (!schema[section]) return;

        errors.push(
            ...validateSection(schema[section], getSection(req, section), section)
        );
    });

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed.",
            errors,
        });
    }

    return next();
};

module.exports = validate;
