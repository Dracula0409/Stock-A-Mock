import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './account.css'

function Account() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNav = (path) => navigate(path);

  const fetchAccount = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5001/api/demat/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.accounts.length > 0) {
        setAccount(res.data.accounts[0]);
      } else {
        setAccount(null);
      }
    } catch (err) {
      console.error('Error fetching demat account:', err);
      setError('Failed to fetch account info');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setCreating(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/demat/create', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAccount();
    } catch (err) {
      console.error('Error creating account:', err);
      setError('Failed to create account. You might already have one.');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  return (
    <div className="account-container">
      <h1 className="account-title">My Demat Account</h1>
  
      <button className="account-back-btn" onClick={() => handleNav('/dashboard')}>
        ⬅ Back to Dashboard
      </button>
  
      {loading ? (
        <p className="account-loading">Loading...</p>
      ) : account ? (
        <div className="account-card">
          <p><strong>Account ID:</strong> {account[0]}</p>
          <p><strong>User ID:</strong> {account[1]}</p>
          <p><strong>Created At:</strong> {new Date(account[3]).toLocaleString()}</p>
        </div>
      ) : (
        <div className="account-empty">
          <p>You don't have a demat account yet.</p>
          <button className="account-create-btn" onClick={handleCreateAccount} disabled={creating}>
            {creating ? 'Creating...' : 'Create Demat Account'}
          </button>
        </div>
      )}
  
      {error && <p className="account-error">{error}</p>}
    </div>
  );
}

export default Account;