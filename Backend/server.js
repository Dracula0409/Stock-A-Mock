const express = require('express');
const app = express();
const port = 3000;

const db = require('./connection/db'); // Import your DB module

app.use(express.json());

// Startup
(async () => {
  await db.initPool();
})();

// Test route
app.get('/test-db', async (req, res) => {
  const tables = await db.fetchTables();
  if (tables) {
    res.json({ tables });
  } else {
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log("\n📴 Gracefully shutting down...");
  await db.closePool();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});