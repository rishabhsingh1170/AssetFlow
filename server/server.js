require("./config/env");

const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await pool.query("select now()");
        console.log("Database connected");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to database");
        console.error(error);
        process.exit(1);
    }
};

startServer();
