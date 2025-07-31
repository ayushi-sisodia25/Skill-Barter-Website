require("dotenv").config();


const { Pool } = require("pg");
const isProduction = process.env.NODE_ENV === "production";

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
console.log(connectionString);
const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString
});
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log("✅ Database connected successfully at:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Database connection failed", err);
  }
})();


module.exports = { pool };