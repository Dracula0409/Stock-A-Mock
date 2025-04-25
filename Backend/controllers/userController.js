const oracledb = require('oracledb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.checkEmail = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT user_id FROM Users WHERE email = :email`,
      [req.body.email]
    );
    res.json({ exists: result.rows.length > 0 });
  } catch (err) {
    console.error("Check Email Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
};

exports.register = async (req, res) => {
  let conn;
  try {
    const { username, email, password } = req.body;
    conn = await oracledb.getConnection();
    const hash = await bcrypt.hash(password, 10);
    
    await conn.execute(
      `INSERT INTO Users (username, email, password_hash) VALUES (:u, :e, :p)`,
      [username, email, hash],
      { autoCommit: true }
    );
    res.status(201).json({ msg: "User registered" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
};

exports.updatePassword = async (req, res) => {
  let conn;
  try {
    const { email, newPassword } = req.body;
    conn = await oracledb.getConnection();
    const newHash = await bcrypt.hash(newPassword, 10);

    const result = await conn.execute(
      `UPDATE Users SET password_hash = :p WHERE email = :e`,
      { p: newHash, e: email },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error("Update Password Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
};

exports.updateUsername = async (req, res) => {
  let conn;
  try {
    const { email, newUsername } = req.body;
    conn = await oracledb.getConnection();

    const result = await conn.execute(
      `UPDATE Users SET username = :u WHERE email = :e`,
      { u: newUsername, e: email },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ msg: "Username updated successfully" });
  } catch (err) {
    console.error("Update Username Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
};

exports.login = async (req, res) => {
  let conn;
  try {
    const { email, password } = req.body;
    conn = await oracledb.getConnection();
    
    const result = await conn.execute(
      `SELECT user_id, password_hash FROM Users WHERE email = :email`,
      [email]
    );
    
    if (!result.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const [user_id, hash] = result.rows[0];
    const match = await bcrypt.compare(password, hash);
    
    if (!match) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: "success", token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
};