const oracledb = require('oracledb');

exports.getPortfolio = async (req, res) => {
  const userId = req.user.user_id;
  const connection = await oracledb.getConnection();

  try {
    // Fetch user holdings
    const result = await connection.execute(
      `SELECT uh.SYMBOL, uh.QUANTITY, uh.AVERAGE_PRICE, s.CURRENT_PRICE, s.STOCK_ID,
              (uh.QUANTITY * s.CURRENT_PRICE) AS CURRENT_VALUE
       FROM USER_HOLDINGS uh
       JOIN STOCKS s ON s.SYMBOL = uh.SYMBOL
       WHERE uh.USER_ID = :userId`,
      { userId }
    );

    // Process the result into an array of holdings
    const holdings = result.rows.map(([symbol, quantity, avgPrice, currentPrice, stockId, currentValue]) => ({
      symbol,
      quantity,
      average_price: avgPrice,
      current_price: currentPrice,
      stock_id: stockId,
      current_value: currentValue
    }));

    // Fetch XIRR for the user
    const xirrResult = await connection.execute(
      `BEGIN :xirr := calculate_xirr(:userId); END;`,
      {
        userId,
        xirr: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    // Fetch CAGR for the user
    const cagrResult = await connection.execute(
      `BEGIN :cagr := calculate_cagr(:userId); END;`,
      {
        userId,
        cagr: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    // Get the symbol for price prediction (default to AAPL if no holdings)
    const symbol = holdings[0]?.symbol || 'AAPL';

    // Fetch predicted stock price and CAGR
    const predictionResult = await connection.execute(
      `BEGIN predict_stock_return(:symbol, 30, :price, :cagr); END;`,
      {
        symbol,
        price: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        cagr: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    // Return the portfolio information along with XIRR, CAGR, and predicted values
    res.json({
      holdings,
      xirr: xirrResult.outBinds.xirr || 0,  // Default to 0 if calculation fails
      cagr: cagrResult.outBinds.cagr || 0,   // Default to 0 if calculation fails
      predicted_price: predictionResult.outBinds.price,
      predicted_cagr: predictionResult.outBinds.cagr
    });

  } catch (err) {
    console.error('Portfolio fetch error:', err);
    res.status(500).send('Error fetching portfolio');
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