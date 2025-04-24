const oracledb = require('oracledb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.checkEmail = async (req, res) => {
  const {email} = req.body;
  const conn = await oracledb.getConnection();
  try {
    const result = await conn.execute(
      `SELECT user_id FROM Users WHERE email = :email`,
      [email]
    );

    // If the email exists, return true
    const emailExists = result.rows.length > 0;
    res.json({ exists: emailExists });
  } catch (err) {
    throw new Error(err.message);
  } finally {
    // Ensure the connection is closed
    if (conn) {
      await conn.close();
    }
  }
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const conn = await oracledb.getConnection();
  const hash = await bcrypt.hash(password, 10);
  try {
    await conn.execute(
      `INSERT INTO Users (username, email, password_hash) VALUES (:u, :e, :p)`,
      [username, email, hash],
      { autoCommit: true }
    );
    res.status(201).json({ msg: "User registered" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const conn = await oracledb.getConnection();
  try {
    const result = await conn.execute(
      `SELECT user_id, password_hash FROM Users WHERE email = :email`,
      [email]
    );
    if (!result.rows.length) return res.status(404).json({ error: "User not found" });

    const [user_id, hash] = result.rows[0];
    const match = await bcrypt.compare(password, hash);
    if (!match) return res.status(401).json({ error: "Incorrect password" });

    const token = jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: "success", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};