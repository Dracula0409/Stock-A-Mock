import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './buy.css';

const Buy = () => {
  const [owned, setOwned] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [accountId, setAccountId] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAcc = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/demat/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAccountId(res.data.accounts[0][0]); // Set account_id state
      } catch (err) {
        console.error('Error fetching account:', err);
      }
    };
    fetchAcc();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portfolioRes, stocksRes] = await Promise.all([
          axios.get('http://localhost:5001/api/portfolio', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5001/api/stock'),
        ]);

        const ownedHoldings = portfolioRes.data.holdings || [];
        setOwned(ownedHoldings);

        const columnNames = stocksRes.data.metaData.map(col => col.name);
        const stockObjects = stocksRes.data.stocks.map(row =>
          Object.fromEntries(row.map((val, i) => [columnNames[i], val]))
        );

        setAllStocks(stockObjects);
        setFilteredStocks(stockObjects);
      } catch (err) {
        console.error('Error fetching stocks:', err);
      }
    };

    fetchData();
  }, [token]);

  const handleBuy = async (stock) => {
    const qty = quantities[stock.SYMBOL] || 0;
    if (qty <= 0) return alert('Enter a valid quantity');

    try {
      await axios.post('http://localhost:5001/api/transaction/buy', {
        account_id: accountId,
        stock_id: stock.ID,
        symbol: stock.SYMBOL,
        quantity: qty,
        price: stock.CURRENT_PRICE,
      });

      setMessage(`Bought ${qty} of ${stock.SYMBOL}`);
      setQuantities({ ...quantities, [stock.SYMBOL]: 0 });
    } catch (err) {
      console.error(err);
      setMessage(`Error buying stock: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearch(term);
    const filtered = allStocks.filter(stock =>
      stock.SYMBOL.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredStocks(filtered);
  };

  return (
    <div className="buy-container">
      <h1>Buy Stocks</h1>
      <input
        type="text"
        value={search}
        onChange={handleSearch}
        placeholder="Search stock symbol..."
        className="search-bar"
      />

      <h2>Your Owned Stocks</h2>
      {owned.length === 0 ? (
        <p>You don't own any stocks yet.</p>
      ) : (
        <div className="stock-list">
          {owned.map((stock) => (
            <div key={stock.symbol} className="stock-card">
              <h3>{stock.symbol}</h3>
              <p>Owned: {stock.quantity}</p>
              <p>Current Price: ₹{stock.current_price}</p>
              <input
                type="number"
                placeholder="Qty"
                value={quantities[stock.symbol] || ''}
                onChange={(e) =>
                  setQuantities({ ...quantities, [stock.symbol]: parseInt(e.target.value) || 0 })
                }
              />
              <button onClick={() => handleBuy({ ...stock, ID: stock.stock_id, SYMBOL: stock.symbol, CURRENT_PRICE: stock.current_price })}>
                Buy More
              </button>
            </div>
          ))}
        </div>
      )}

      <h2>Search Results</h2>
      <div className="stock-list">
        {filteredStocks.map((stock) => (
          <div key={stock.ID} className="stock-card">
            <h3>{stock.SYMBOL}</h3>
            <p>Current Price: ₹{stock.CURRENT_PRICE}</p>
            <input
              type="number"
              placeholder="Qty"
              value={quantities[stock.SYMBOL] || ''}
              onChange={(e) =>
                setQuantities({ ...quantities, [stock.SYMBOL]: parseInt(e.target.value) || 0 })
              }
            />
            <button onClick={() => handleBuy(stock)}>Buy</button>
          </div>
        ))}
      </div>

      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default Buy;