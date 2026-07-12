require("dotenv").config({
    path: "./server/.env",
});

const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Test database connection
        await pool.query("SELECT NOW()");
        console.log("✅ Database Connected");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to connect to database");
        console.error(error);
        process.exit(1);
    }
}

startServer();