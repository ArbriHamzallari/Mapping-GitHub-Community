/**
 * API Base URL - points to FastAPI backend
 * In production, this should be set via environment variables
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

/**
 * Fetches graph data from the backend API
 * @param {string} username - GitHub username to mine
 * @returns {Promise<{nodes: Array, links: Array}>} Graph data with nodes and links
 * @throws {Error} Error with user-friendly message
 */
export async function fetchGraph(username) {
  const url = `${API_BASE_URL}/mine/${encodeURIComponent(username)}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Handle non-OK HTTP status codes
    if (!response.ok) {
      let errorMessage = `Server error: ${response.status} ${response.statusText}`;
      
      // Try to parse error response as JSON
      try {
        const errorData = await response.json();
        if (errorData.detail || errorData.message || errorData.error) {
          errorMessage = errorData.detail || errorData.message || errorData.error;
        }
      } catch (parseError) {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText.substring(0, 200); // Limit error text length
          }
        } catch (textError) {
          // Use default error message
        }
      }
      
      throw new Error(errorMessage);
    }

    // Parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      throw new Error('Invalid response format: Server did not return valid JSON');
    }

    // Handle empty result
    if (!data || (Array.isArray(data) && data.length === 0)) {
      throw new Error('No data found for this username. The user may not exist or have no connections.');
    }

    // Normalize data structure - handle different possible response formats
    // Backend might return: {nodes: [...], links: [...]} or {edges: [...], nodes: [...]} etc.
    let nodes = [];
    let links = [];

    if (data.nodes && data.links) {
      nodes = data.nodes;
      links = data.links;
    } else if (data.nodes && data.edges) {
      nodes = data.nodes;
      links = data.edges;
    } else if (Array.isArray(data)) {
      // If data is an array, assume it's edges/links
      links = data;
    } else {
      // Try to extract nodes and links from any structure
      nodes = data.nodes || data.node_list || [];
      links = data.links || data.edges || data.edge_list || [];
    }

    // Ensure we have valid data structure
    if ((!nodes || nodes.length === 0) && (!links || links.length === 0)) {
      throw new Error('Received empty graph data. No nodes or links found.');
    }

    // Return clean graphData structure for react-force-graph-2d
    // Library expects exactly {nodes: [], links: []} format
    return {
      nodes: nodes || [],
      links: links || []
    };

  } catch (error) {
    // Handle network errors (fetch failures)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Could not connect to the server. Please check if the backend is running.');
    }

    // Handle AbortError (if request was cancelled)
    if (error.name === 'AbortError') {
      throw new Error('Request was cancelled.');
    }

    // Re-throw our custom errors
    if (error.message) {
      throw error;
    }

    // Fallback for unknown errors
    throw new Error('An unexpected error occurred while fetching graph data.');
  }
}
