const cron = require('node-cron');
const axios = require('axios');
const oracledb = require('oracledb');
require('dotenv').config();

// Update all stock prices every minute
cron.schedule('* * * * *', async () => {
  let connection;

  try {
    connection = await oracledb.getConnection();
    const res = await connection.execute(
        'SELECT symbol FROM Stocks',
        [],
        { outFormat: oracledb.OUT_FORMAT_ARRAY }
    );
      
    const symbols = res.rows.map(row => row[0]);
    
    console.log('Extracted symbols:', symbols);

    console.log(`⏳ Updating prices for ${symbols.length} stocks...\n`);

    for (const symbol of symbols) {
      try {
        console.log(`🔄 Fetching price for ${symbol}...`);

        const apiResponse = await axios.get('https://finnhub.io/api/v1/quote', {
          params: { symbol, token: process.env.FINNHUB_API_KEY },
        });

        const price = apiResponse.data.c;

        if (!price || price === 0) {
          console.warn(`⚠️ Invalid price for ${symbol}. API response:`, apiResponse.data);
          continue;
        }

        await connection.execute(
          `
          UPDATE Stocks
          SET current_price = :price,
              last_updated = CURRENT_TIMESTAMP
          WHERE symbol = :symbol
          `,
          { price, symbol },
          { autoCommit: true }
        );

        console.log(`✅ Updated ${symbol}: $${price}`);
      } catch (err) {
        console.error(`❌ Failed to update ${symbol}:`, err.message);
      }

      // Small delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("\n📈 All stock prices updated successfully 🕒\n");
  } catch (err) {
    console.error("❌ Error during stock update cron job:", err.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("🔌 Oracle DB connection closed.\n");
      } catch (err) {
        console.error("⚠️ Error closing DB connection:", err.message);
      }
    }
  }
});