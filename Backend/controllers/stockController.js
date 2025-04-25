const oracledb = require('oracledb');

exports.getAllStocks = async (req, res) => {
  const conn = await oracledb.getConnection();
  try {
    const result = await conn.execute(`SELECT * FROM Stocks`);
    res.json({ stocks: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) {
      try {
        await conn.close(); // ✅ Release back to pool
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
};