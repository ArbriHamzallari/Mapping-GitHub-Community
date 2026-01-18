import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import SearchPanel from './components/SearchPanel';
import GraphView from './components/GraphView';
import Footer from './components/Footer';
import { fetchGraph } from './utils/api';

function App() {
  // State management
  const [graphData, setGraphData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  /**
   * Converts technical error messages to user-friendly messages
   */
  const formatErrorMessage = (errorMessage) => {
    if (!errorMessage) return 'Something went wrong. Please try again.';

    // Network errors
    if (errorMessage.toLowerCase().includes('network') || 
        errorMessage.toLowerCase().includes('could not connect')) {
      return 'Unable to connect to the server. Please check if the backend is running on port 8000.';
    }

    // Empty results
    if (errorMessage.toLowerCase().includes('no data') || 
        errorMessage.toLowerCase().includes('empty')) {
      return 'No community connections found for this username. The user may not exist or have no public connections.';
    }

    // Invalid JSON / server errors
    if (errorMessage.toLowerCase().includes('invalid response') || 
        errorMessage.toLowerCase().includes('json')) {
      return 'The server returned an unexpected response. Please try again later.';
    }

    // Server errors (4xx, 5xx)
    if (errorMessage.toLowerCase().includes('server error') || 
        errorMessage.toLowerCase().includes('500') ||
        errorMessage.toLowerCase().includes('404')) {
      if (errorMessage.includes('404')) {
        return 'User not found. Please check the GitHub username and try again.';
      }
      return 'Server encountered an error. Please try again in a moment.';
    }

    // Rate limiting
    if (errorMessage.toLowerCase().includes('rate limit') || 
        errorMessage.toLowerCase().includes('429')) {
      return 'Too many requests. Please wait a moment before trying again.';
    }

    // GitHub API specific errors
    if (errorMessage.toLowerCase().includes('github') || 
        errorMessage.toLowerCase().includes('api')) {
      return 'GitHub API error. The user may be private or the request was rejected.';
    }

    // Return original message if no pattern matches, but make it more friendly
    return errorMessage.length > 100 
      ? `${errorMessage.substring(0, 100)}...` 
      : errorMessage;
  };

  /**
   * Handles search submission when user enters username and hits Enter or clicks button
   * - Calls fetchGraph API function
   * - Manages loading state (disables button, shows spinner)
   * - Updates graphData state on success
   * - Handles errors with user-friendly messages
   */
  const handleSearch = async (username) => {
    // Reset previous states
    setError(null);
    setGraphData(null);
    setLoading(true);
    setHasSearched(true);

    try {
      // Call fetchGraph API - this connects to backend at /mine/{username}
      const data = await fetchGraph(username);
      
      // Update state with graph data (nodes & links)
      setGraphData(data);
      setError(null); // Clear any previous errors on success
    } catch (err) {
      // Convert technical errors to user-friendly messages
      const friendlyError = formatErrorMessage(err.message || 'An error occurred while fetching data');
      setError(friendlyError);
      setGraphData(null);
    } finally {
      // Always disable loading state when done (success or error)
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Header />
      {/* 
        SearchPanel:
        - Input field for username (disabled during loading)
        - Form submission on Enter key or button click
        - Button shows "Mining..." when loading (disabled={loading})
        - Button is automatically disabled during mining
        - Displays friendly error messages below input
      */}
      <SearchPanel 
        onSearch={handleSearch} 
        loading={loading} 
        error={error} 
      />
      {/* 
        GraphView:
        - Shows placeholder screen when !hasSearched (before first search)
        - Displays loading spinner during mining
        - Shows friendly error messages on failure
        - Renders ForceGraph2D visualization with zoom-to-fit
        - Enhanced hover tooltips for better readability
      */}
      <GraphView 
        graphData={graphData} 
        error={error} 
        loading={loading}
        hasSearched={hasSearched}
      />
      <Footer />
    </div>
  );
}

export default App;
