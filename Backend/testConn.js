const oracledb = require('oracledb');
require('dotenv').config();

async function testConn() {
  try {
    oracledb.initOracleClient({ libDir: '/Users/jeffinasir/oracle/instantclient_19_8' });
    const conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING
    });
    console.log("✅ Connected!");
    await conn.close();
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}

module.exports = {
    testConn
};