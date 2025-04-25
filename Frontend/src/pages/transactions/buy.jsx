import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './buy.css';

const Buy = () => {
  const [owned, setOwned] = useState([]);
  const [filteredOwned, setFilteredOwned] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [accountId, setAccountId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAcc = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/demat/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAccountId(res.data.accounts[0][0]);
      } catch (err) {
        console.error('Error fetching account:', err);
      }
    };
    fetchAcc();
  }, [token]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/portfolio', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const holdings = res.data.holdings || [];
        setOwned(holdings);
        setFilteredOwned(holdings);
      } catch (err) {
        console.error('Error fetching portfolio:', err);
      }
    };

    fetchPortfolio();
  }, [token]);

  const handleBuy = async (stock) => {
    const qty = quantities[stock.symbol] || 0;
    if (qty <= 0) return alert('Enter a valid quantity');

    try {
      await axios.post('http://localhost:5001/api/transaction/buy', {
        account_id: accountId,
        stock_id: stock.stock_id,
        symbol: stock.symbol,
        quantity: qty,
        price: stock.current_price,
      });

      alert('Stock bought Successfully!');
      setMessage(`Bought ${qty} of ${stock.symbol}`);
      setQuantities({ ...quantities, [stock.symbol]: 0 });
    } catch (err) {
      console.error(err);
      setMessage(`Error buying stock: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearch(term);
    const filtered = owned.filter(stock =>
      stock.symbol.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredOwned(filtered);
  };

  return (
    <div className="buy-container">
      <div className="buy-header">
        <h1>Buy Stocks</h1>
        <button className="all-stocks-btn" onClick={() => navigate('/search')}>
          📊 All Stocks
        </button>
      </div>

      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        ⬅ Back to Dashboard
      </button>

      <input
        type="text"
        value={search}
        onChange={handleSearch}
        placeholder="Search your stock symbol..."
        className="search-bar"
      />

      <h2>Your Owned Stocks</h2>
      {filteredOwned.length === 0 ? (
        <p>You don't own any stocks or no matching results found.</p>
      ) : (
        <div className="stock-list">
          {filteredOwned.map((stock) => (
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
              <button onClick={() => handleBuy(stock)}>Buy More</button>
            </div>
          ))}
        </div>
      )}

      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default Buy;