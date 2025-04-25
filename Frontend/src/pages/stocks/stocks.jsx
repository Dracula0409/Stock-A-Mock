import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './stocks.css'; // Reusing the same CSS for UI consistency

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [accountId, setAccountId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/demat/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAccountId(res.data.accounts[0][0]);
      } catch (err) {
        console.error('Error fetching account:', err);
      }
    };

    const fetchStocks = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/stock');
        const stockList = res.data.stocks.map(row => ({
          ID: row[0],
          SYMBOL: row[1],
          SECTOR: row[2],
          CURRENT_PRICE: row[3],
          LAST_UPDATED: row[4],
        }));
        setStocks(stockList);
        setFilteredStocks(stockList);
      } catch (err) {
        console.error('Error fetching stocks:', err);
      }
    };

    fetchAccount();
    fetchStocks();
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

      alert('Stock bought Successfully!');
      setMessage(`Bought ${qty} of ${stock.SYMBOL}`);
      setQuantities({ ...quantities, [stock.SYMBOL]: 0 });
    } catch (err) {
      console.error(err);
      setMessage(`Error buying stock: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleSearch = (e) => {
    const keyword = e.target.value;
    setSearch(keyword);
    const filtered = stocks.filter(stock =>
      stock.SYMBOL.toLowerCase().includes(keyword.toLowerCase())
    );
    setFilteredStocks(filtered);
  };

  return (
    <div className="buy-container">
      <h1>All Available Stocks</h1>

      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        ⬅ Back to Dashboard
      </button>

      <input
        type="text"
        value={search}
        onChange={handleSearch}
        placeholder="Search stock symbol..."
        className="search-bar"
      />

      <div className="stock-list">
        {filteredStocks.map((stock) => (
          <div key={stock.ID} className="stock-card">
            <h3>{stock.SYMBOL}</h3>
            <p>Current Price: ${stock.CURRENT_PRICE}</p>
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

export default Stocks;