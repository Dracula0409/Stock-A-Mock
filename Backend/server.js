const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const dotenv = require('dotenv');
require('dotenv').config();

const app = express();
const db = require('./connection/db'); // Import your DB module
const port = 5001;

const allowedOrigins = [
  "http://localhost:5173", 
  "http://10.7.103.226:5173",
  "http://10.5.12.254:5173",
  "http://192.168.1.200:5173",
  "http://10.21.68.19:5173"     //library
];

app.use(cors({
  origin : (origin, callback) => {
    if(!origin || allowedOrigins.includes(origin)){
      callback(null, true);
    }
    else{
      callback(new Error("Not Allowed by CORS."));
    }
  },
  credentials: true, 
}));

app.use(express.json());

const userRoutes = require('./routes/user');
const mailRoutes = require('./routes/mail');
const dematRoutes = require('./routes/demat');
const stockRoutes = require('./routes/stock');
const transactionRoutes = require('./routes/transaction');
const portfolioRoutes = require('./routes/portfolio'); 

//require('./jobs/stockUpdater');

app.use('/api/user', userRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/demat', dematRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/portfolio', portfolioRoutes); 

// Startup
(async () => {
  await db.initPool();
})();

app.listen(port, '0.0.0.0', () => {
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
