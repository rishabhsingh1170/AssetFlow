const auditModel = require("../models/Audit");

const getAuditLogs = async (filters) => auditModel.getAuditLogs(filters);

module.exports = {
    getAuditLogs,
};
