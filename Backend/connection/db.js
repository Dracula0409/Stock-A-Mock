const oracledb = require('oracledb');
require('dotenv').config();

oracledb.initOracleClient({
  libDir: process.env.DB_LibDir //Use the path for instantclient in your own machine
});

async function initPool() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1 
    });
    console.log("📘 Oracle connection pool created.");
  } catch (err) {
    console.error("❌ Error creating pool:", err);
    process.exit(1);
  }
}

async function closePool() {
    try {
      await oracledb.getPool().close(10); // wait 10 seconds for all connections to close
      console.log("🧹 Oracle connection pool closed.");
    } catch (err) {
      console.error("❌ Error closing pool:", err);
    }
  }

module.exports = {
    initPool,
    closePool
};