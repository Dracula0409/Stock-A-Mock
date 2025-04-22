const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const dotenv = require('dotenv');
require('dotenv').config();

const app = express();
const db = require('./connection/db'); // Import your DB module
const port = 3000;

app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/user');
const dematRoutes = require('./routes/demat');
const stockRoutes = require('./routes/stock');
const transactionRoutes = require('./routes/transaction');
const portfolioRoutes = require('./routes/portfolio'); 

require('./jobs/stockUpdater');

app.use('/api/user', userRoutes);
app.use('/api/demat', dematRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/portfolio', portfolioRoutes); 

// Startup
(async () => {
  await db.initPool();
})();

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log("📴 Gracefully shutting down...");
  try {
    await oracledb.getPool().close(0);
    console.log("🧹 Oracle connection pool closed.");
  } catch (err) {
    console.error("Error closing Oracle pool:", err);
  }
  process.exit(0);
});
