const express = require("express");
const app = express();

app.use(express.json());

const departmentRoutes = require("./routes/department.routes");

app.use("/api/departments", departmentRoutes);

module.exports = app;