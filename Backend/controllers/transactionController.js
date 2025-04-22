const oracledb = require('oracledb');

exports.buyStock = async (req, res) => {
  const { account_id, stock_id, symbol, quantity, price } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `BEGIN buy_stock(:account_id, :stock_id, :symbol, :quantity, :price); END;`,
      { account_id, stock_id, symbol, quantity, price }
    );
    await connection.commit();
    res.status(200).json({ message: 'Stock bought successfully' });
  } catch (err) {
    console.error('Error in buyStock:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.sellStock = async (req, res) => {
  const { account_id, stock_id, symbol, quantity, price } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `BEGIN sell_stock(:account_id, :stock_id, :symbol, :quantity, :price); END;`,
      { account_id, stock_id, symbol, quantity, price }
    );
    await connection.commit();
    res.status(200).json({ message: 'Stock sold successfully' });
  } catch (err) {
    console.error('Error in sellStock:', err);
    res.status(500).json({ error: err.message });
  }
};