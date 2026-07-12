const auditService = require("../services/audit.service");

const getAuditLogs = async (req, res) => {
    try {
        const logs = await auditService.getAuditLogs(req.query);

        return res.status(200).json({
            success: true,
            data: logs,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch audit logs.",
            error: error.message,
        });
    }
};

module.exports = {
    getAuditLogs,
};
