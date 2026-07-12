const dashboardService = require("../services/dashboard.service");

const getDashboardSummary = async (req, res) => {
    try {
        const summary = await dashboardService.getDashboardSummary();

        return res.status(200).json({
            success: true,
            data: summary,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard summary.",
            error: error.message,
        });
    }
};

module.exports = {
    getDashboardSummary,
};
