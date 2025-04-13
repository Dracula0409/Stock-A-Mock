const oracledb = require('oracledb');

oracledb.initOracleClient({
  libDir: '/Users/jeffinasir/oracle/instantclient_19_8'//Use the path for instantclient in your own machine
});

async function initPool() {
  try {
    await oracledb.createPool({
      user: 's2023103507',
      password: 'DWTQCPVR',
      connectString: 'localhost:31521/sfldb2.sfdc.audcse',
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

async function fetchTables() {
    let connection;
    try {
        connection = await oracledb.getConnection();  // fetches from the pool
        const result = await connection.execute(`SELECT table_name FROM user_tables`);
        console.log(result.rows);
    } catch (err) {
        console.error("❌ Query error:", err);
    } finally {
        if (connection) {
        try {
            await connection.close(); // returns it to the pool
        } catch (err) {
            console.error("❌ Error closing connection:", err);
        }
        }
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
  
  process.on('SIGINT', async () => {
    console.log("\n📴 Shutting down...");
    await closePool();
    process.exit(0);
});


module.exports = {
    initPool,
    fetchTables,
    closePool
};