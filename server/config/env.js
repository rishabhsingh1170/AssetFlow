const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
    path: path.resolve(__dirname, "../.env"),
    quiet: true,
});

module.exports = {
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV || "development",
    port: process.env.PORT || 5000,
};
