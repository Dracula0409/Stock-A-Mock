const oracledb = require('oracledb');

exports.createDemat = async (req, res) => {
  const conn = await oracledb.getConnection();
  try {
    const result = await conn.execute(
      `INSERT INTO DematAccounts (user_id) VALUES (:uid) RETURNING account_id INTO :aid`,
      { uid: req.user.user_id, aid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } },
      { autoCommit: true }
    );
    res.status(201).json({ account_id: result.outBinds.aid[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyDemat = async (req, res) => {
  const conn = await oracledb.getConnection();
  try {
    const result = await conn.execute(
      `SELECT * FROM DematAccounts WHERE user_id = :uid`,
      [req.user.user_id]
    );
    res.json({ accounts: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};