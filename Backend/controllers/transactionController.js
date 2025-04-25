const oracledb = require('oracledb');

exports.buyStock = async (req, res) => {
  const { account_id, stock_id, symbol, quantity, price } = req.body;
  const connection = await oracledb.getConnection();

  try {
    await connection.execute(
      `BEGIN buy_stock(:account_id, :stock_id, :symbol, :quantity, :price); END;`,
      { account_id, stock_id, symbol, quantity, price }
    );
    await connection.commit();
    res.status(200).json({ message: 'Stock bought successfully' });
  } catch (err) {
    console.error('Error in buyStock:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) {
      try {
        await connection.close(); // ✅ Release back to pool
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
};

exports.sellStock = async (req, res) => {
  const { account_id, stock_id, symbol, quantity, price } = req.body;
  const connection = await oracledb.getConnection();

  try {
    await connection.execute(
      `BEGIN sell_stock(:account_id, :stock_id, :symbol, :quantity, :price); END;`,
      { account_id, stock_id, symbol, quantity, price }
    );
    await connection.commit();
    res.status(200).json({ message: 'Stock sold successfully' });
  } catch (err) {
    console.error('Error in sellStock:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) {
      try {
        await connection.close(); // ✅ Release back to pool
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
};