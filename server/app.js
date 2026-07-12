const express = require("express");
const app = express();

app.use(express.json());

const departmentRoutes = require("./routes/departments.routes");
const categoryRoutes = require("./routes/categories.routes");
const userRoutes = require("./routes/users.routes");
const authRoutes = require("./routes/auth.routes");
const assetRoutes = require("./routes/assets.routes");
const locationRoutes = require("./routes/locations.routes");
const bookingRoutes = require("./routes/booking.routes");
const maintenanceRoutes = require("./routes/maintenance.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reportRoutes = require("./routes/reports.routes");
const auditRoutes = require("./routes/audit.routes");

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/audit", auditRoutes);

module.exports = app;
