const oracledb = require('oracledb');

exports.getPortfolio = async (req, res) => {
    const conn = await oracledb.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM Portfolio WHERE account_id IN (
           SELECT account_id FROM DematAccounts WHERE user_id = :uid
         )`,
        [req.user.user_id]
      );
      res.json({ portfolio: result.rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  exports.getCAGR = async (req, res) => {
    const conn = await oracledb.getConnection();
    try {
      const result = await conn.execute(
        `SELECT account_id, calculate_cagr(account_id) AS cagr 
         FROM DematAccounts WHERE user_id = :uid`,
        [req.user.user_id]
      );
      res.json({ cagr: result.rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };