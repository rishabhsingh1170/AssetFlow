const express = require("express");
const app = express();

app.use(express.json());

const departmentRoutes = require("./routes/departments.routes");
const categoryRoutes = require("./routes/categories.routes");
const userRoutes = require("./routes/users.routes");
const assetRoutes = require("./routes/assets.routes");
const locationRoutes = require("./routes/locations.routes");

app.use("/api/departments", departmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/locations", locationRoutes);

module.exports = app;
