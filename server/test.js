require("dotenv").config();

const pool = require("./config/db");

async function testDB() {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("✅ Database Connected");
        console.log(result.rows[0]);
    } catch (err) {
        console.error("❌ Database Error");
        console.error(err);
    } finally {
        await pool.end();
    }
}

testDB();