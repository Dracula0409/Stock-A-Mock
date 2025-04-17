const express = require('express');
/*
const userRoutes = require('./routes/user');
const dematRoutes = require('./routes/demat');
const stockRoutes = require('./routes/stock');
const txnRoutes = require('./routes/transaction');
*/
require('dotenv').config();
require('./jobs/stockUpdater');
const port = 3000;

const app = express();
const db = require('./connection/db'); // Import your DB module

app.use(express.json());

// Startup
(async () => {
  await db.initPool();
})();

/*
app.use('/api/users', userRoutes);
app.use('/api/demat', dematRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/transactions', txnRoutes);
*/

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log("\n📴 Gracefully shutting down...");
  await db.closePool();
  process.exit(0);
});
