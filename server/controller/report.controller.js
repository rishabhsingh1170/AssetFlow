const reportService = require("../services/report.service");

const sendReport = (handler) => async (req, res) => {
    try {
        const data = await handler();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch report.",
            error: error.message,
        });
    }
};

module.exports = {
    getAssetReport: sendReport(reportService.getAssetReport),
    getBookingReport: sendReport(reportService.getBookingReport),
    getMaintenanceReport: sendReport(reportService.getMaintenanceReport),
};
