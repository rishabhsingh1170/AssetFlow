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

        if (error.code === "ENOTFOUND") {
            console.error(
                "Database host could not be resolved by Node.js. If you are using Supabase, use the Session Pooler or Transaction Pooler connection string from Project Settings > Database instead of the direct db.<project-ref>.supabase.co URL."
            );
            console.error(
                "Also URL-encode special characters in the database password, for example @ becomes %40."
            );
        }

        console.error(error);
        process.exit(1);
    }
};

startServer();
