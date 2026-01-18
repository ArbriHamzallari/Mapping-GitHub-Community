import React, { useState, useEffect } from 'react';
import './SearchPanel.css';

function SearchPanel({ onSearch, loading, error }) {
  const [username, setUsername] = useState('');

  // Clear error state when user starts typing
  useEffect(() => {
    if (error) {
      // Keep the error visible but allow user to retry
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && !loading) {
      onSearch(username.trim());
    }
  };

  return (
    <div className="search-panel">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            className={`search-input ${error ? 'search-input-error' : ''}`}
            placeholder="Enter GitHub username to scan..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            className={`search-button ${loading ? 'search-button-loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Scanning...' : 'Scan Network'}
          </button>
        </div>
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}
      </form>
    </div>
  );
}

export default SearchPanel;
