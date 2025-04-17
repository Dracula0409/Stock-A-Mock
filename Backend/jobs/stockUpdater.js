const cron = require('node-cron');
const axios = require('axios');
const oracledb = require('oracledb');
require('dotenv').config();

cron.schedule('* * * * *', async () => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const res = await connection.execute('SELECT symbol FROM Stocks');
    const symbols = res.rows.map(row => row[0]);

    for (let symbol of symbols) {
      try {
        console.log(`Updating ${symbol}...`);
        const apiRes = await axios.get('https://finnhub.io/api/v1/quote', {
          params: { symbol, token: process.env.FINNHUB_API_KEY },
        });
        const price = apiRes.data.c;

        await connection.execute(
          `
          UPDATE Stocks
          SET current_price = :price, last_updated = CURRENT_TIMESTAMP
          WHERE symbol = :symbol
        `,
          [price, symbol],
          { autoCommit: true }
        );
      } catch (err) {
        console.error(`Error updating ${symbol}`, err.message);
      }
    }

    console.log("Stock prices updated 🕒");
  } catch (err) {
    console.error("Error in cron job:", err.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err.message);
      }
    }
  }
});