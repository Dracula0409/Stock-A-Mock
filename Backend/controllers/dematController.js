const oracledb = require('oracledb');

exports.createDemat = async (req, res) => {
  const conn = await oracledb.getConnection();
  try {
    // Check if user already has a Demat account
    const existing = await conn.execute(
      `SELECT account_id FROM DematAccounts WHERE user_id = :user_id`,
      [req.user.user_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ 
        error: "User already has a Demat account" 
      });
    }

    // Create new account if none exists
    const result = await conn.execute(
      `INSERT INTO DematAccounts (user_id) VALUES (:user_id) RETURNING account_id INTO :return_account_id`,
      { 
        user_id: req.user.user_id,
        return_account_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } 
      },
      { autoCommit: true }
    );

    res.status(201).json({ account_id: result.outBinds.return_account_id[0] });

  } catch (err) {
    // Handle unique constraint violation (ORA-00001)
    if (err.errorNum === 1) {
      res.status(409).json({ error: "User already has a Demat account" });
    } else {
      res.status(500).json({ error: err.message });
    }
  } finally {
    if (conn) await conn.close();
  }
};


exports.getMyDemat = async (req, res) => {
  const conn = await oracledb.getConnection();
  try {
    const result = await conn.execute(
      `SELECT * FROM DematAccounts WHERE user_id = :user_id`,
      [req.user.user_id]
    );
    res.json({ accounts: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }finally {
    if (conn) {
      try {
        await conn.close(); // ✅ Release back to pool
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
};