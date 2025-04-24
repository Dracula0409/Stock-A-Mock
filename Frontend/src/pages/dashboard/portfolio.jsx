import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./portfolio.css";

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5001/api/portfolio', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPortfolio(res.data);
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        setError('Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const handleNav = (path) => navigate(path);

  if (loading) return <div className="loading">Loading your portfolio...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <nav className="nav-bar">
        <h1 className="title">Stock-a-Mock Dashboard</h1>
        <div className="btn-group">
          <button onClick={() => handleNav('/buy')} className="btn buy">Buy</button>
          <button onClick={() => handleNav('/sell')} className="btn sell">Sell</button>
          <button onClick={() => handleNav('/search')} className="btn search">Search</button>
          <button onClick={() => handleNav('/account')} className="btn account">Account</button>
        </div>
      </nav>

      {portfolio.holdings.length === 0 ? (
        <div className="no-holdings">
          You currently have no stocks in your portfolio. Start by <span className="link" onClick={() => handleNav('/buy')}>buying some stocks</span>.
        </div>
      ) : (
        <div>
          <h2 className="section-title">Your Holdings</h2>
          <table className="holdings-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Quantity</th>
                <th>Avg. Price</th>
                <th>Current Value</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.holdings.map((stock, idx) => (
                <tr key={idx} className="table-row">
                  <td>{stock.symbol}</td>
                  <td>{stock.quantity}</td>
                  <td>₹{stock.average_price.toFixed(2)}</td>
                  <td>₹{stock.current_value.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="metrics-card">
            <h3>Predictions & Metrics</h3>
            <p><strong>XIRR:</strong> {portfolio.xirr.toFixed(2)}%</p>
            <p><strong>CAGR:</strong> {portfolio.cagr.toFixed(2)}%</p>
            <p><strong>Predicted Price (30 days):</strong> ₹{portfolio.predicted_price.toFixed(2)}</p>
            <p><strong>Predicted CAGR:</strong> {portfolio.predicted_cagr.toFixed(2)}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;