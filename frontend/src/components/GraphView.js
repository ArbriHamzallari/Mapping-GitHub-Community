import React, { useRef, useEffect, useCallback, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import './GraphView.css'; // Keep minimal container styles, use CSS-in-JS for feedback UI

function GraphView({ graphData, error, loading }) {
  const fgRef = useRef();
  const containerRef = useRef();
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // CSS-in-JS Styles
  const styles = {
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      zIndex: 10,
    },
    loading: {
      textAlign: 'center',
      padding: '3rem',
      background: 'rgba(0, 15, 35, 0.85)',
      borderRadius: '16px',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(6, 182, 212, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(6, 182, 212, 0.2)',
    },
    spinner: {
      width: '48px',
      height: '48px',
      margin: '0 auto 1.5rem',
      border: '4px solid rgba(100, 116, 139, 0.3)',
      borderTopColor: '#06b6d4',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
    },
    loadingText: {
      margin: 0,
      color: '#e5e7eb',
      fontSize: '1rem',
      fontWeight: 400,
    },
    error: {
      textAlign: 'center',
      padding: '3rem',
      background: 'rgba(0, 15, 35, 0.85)',
      borderRadius: '16px',
      border: '2px solid rgba(239, 68, 68, 0.6)',
      maxWidth: '500px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(239, 68, 68, 0.2)',
    },
    errorIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
      lineHeight: 1,
    },
    errorTitle: {
      margin: '0 0 0.75rem 0',
      fontSize: '1.5rem',
      color: '#fca5a5',
      fontWeight: 600,
    },
    errorDescription: {
      margin: 0,
      fontSize: '0.95rem',
      color: '#fca5a5',
      lineHeight: 1.6,
      wordBreak: 'break-word',
    },
    placeholder: {
      width: '100%',
      height: '100%',
      minHeight: '500px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    placeholderSvg: {
      width: '100%',
      height: '100%',
      opacity: 0.3,
    },
    placeholderContent: {
      textAlign: 'center',
      padding: '2rem',
      background: 'rgba(0, 15, 35, 0.7)',
      borderRadius: '12px',
      border: '2px dashed rgba(6, 182, 212, 0.4)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
    },
    placeholderTitle: {
      margin: 0,
      fontSize: '1.5rem',
      color: '#e5e7eb',
      fontWeight: 600,
    },
    placeholderSubtitle: {
      margin: '0.5rem 0 0 0',
      fontSize: '1rem',
      color: '#9ca3af',
      fontWeight: 300,
    },
    tooltip: {
      position: 'fixed',
      left: tooltip.x + 10,
      top: tooltip.y - 10,
      background: 'rgba(17, 24, 39, 0.95)',
      color: '#e5e7eb',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      fontSize: '0.875rem',
      pointerEvents: 'none',
      zIndex: 1000,
      border: '1px solid #374151',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      whiteSpace: 'pre-line',
      maxWidth: '250px',
      lineHeight: 1.5,
      display: tooltip.show ? 'block' : 'none',
      backdropFilter: 'blur(8px)',
    },
  };

  // Cosmic color palette for different community groups
  const getNodeColor = (node) => {
    const colors = [
      '#06b6d4', // Cyan (primary cosmic)
      '#a855f7', // Purple (nebula)
      '#3b82f6', // Blue (stellar)
      '#8b5cf6', // Violet (galactic)
      '#ec4899', // Pink (quasar)
      '#14b8a6', // Teal (aurora)
      '#6366f1', // Indigo (deep space)
      '#06b6d4', // Cyan (repeat)
      '#a855f7', // Purple (repeat)
      '#3b82f6', // Blue (repeat)
      '#8b5cf6', // Violet (repeat)
      '#ec4899', // Pink (repeat)
    ];
    return colors[node.group % colors.length];
  };

  // Handle node click - open GitHub profile
  const handleNodeClick = useCallback((node) => {
    const githubUrl = `https://github.com/${node.id}`;
    window.open(githubUrl, '_blank', 'noopener,noreferrer');
  }, []);

  // Handle node hover - tooltip is handled by nodeLabel prop, this is just for cleanup
  const handleNodeHover = useCallback((node, prevNode) => {
    // Tooltip is automatically shown via nodeLabel prop in ForceGraph2D
    // No need to access canvas directly - the library handles this
    if (!node) {
      setTooltip({ show: false, x: 0, y: 0, content: '' });
    }
  }, []);

  // Handle mouse move for custom tooltip
  const handleMouseMove = useCallback((event) => {
    if (event.target && event.target.dataset && event.target.dataset.nodeId) {
      const rect = event.target.getBoundingClientRect();
      setTooltip({
        show: true,
        x: event.clientX,
        y: event.clientY,
        content: event.target.dataset.nodeLabel || '',
      });
    }
  }, []);

  // Update dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Zoom to fit after graph loads
  useEffect(() => {
    if (graphData && graphData.nodes && graphData.nodes.length > 0 && fgRef.current) {
      // Wait for graph to stabilize, then zoom to fit
      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(400, 50);
        }
      }, 500);
    }
  }, [graphData]);

  return (
    <div className="graph-view">
      <div className="graph-container" ref={containerRef}>
        {/* Loading indicator */}
        {loading && (
            <div style={styles.overlay}>
              <div style={styles.loading}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Scanning cosmic network... This may take a moment</p>
              </div>
            </div>
        )}

        {/* Error message */}
        {error && !loading && (
          <div style={styles.overlay}>
            <div style={styles.error}>
              <div style={styles.errorIcon}>⚠️</div>
              <p style={styles.errorTitle}>Error Loading Graph</p>
              <p style={styles.errorDescription}>{error}</p>
            </div>
          </div>
        )}

        {/* Placeholder when no data is loaded */}
        {!graphData && !error && !loading && (
          <div style={styles.placeholder}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 800 500"
              style={styles.placeholderSvg}
            >
              {/* Sample graph visualization - nodes and edges */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#60a5fa" />
                </marker>
              </defs>
              
              {/* Sample edges */}
              <line x1="200" y1="250" x2="400" y2="150" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <line x1="200" y1="250" x2="400" y2="350" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <line x1="400" y1="150" x2="600" y2="250" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <line x1="400" y1="350" x2="600" y2="250" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrowhead)" />
              
              {/* Sample nodes */}
              <circle cx="200" cy="250" r="30" fill="#3b82f6" stroke="#1e40af" strokeWidth="3" />
              <circle cx="400" cy="150" r="30" fill="#3b82f6" stroke="#1e40af" strokeWidth="3" />
              <circle cx="400" cy="350" r="30" fill="#3b82f6" stroke="#1e40af" strokeWidth="3" />
              <circle cx="600" cy="250" r="30" fill="#3b82f6" stroke="#1e40af" strokeWidth="3" />
              
              {/* Node labels */}
              <text x="200" y="260" textAnchor="middle" fill="#e5e7eb" fontSize="14" fontWeight="600">Node 1</text>
              <text x="400" y="160" textAnchor="middle" fill="#e5e7eb" fontSize="14" fontWeight="600">Node 2</text>
              <text x="400" y="360" textAnchor="middle" fill="#e5e7eb" fontSize="14" fontWeight="600">Node 3</text>
              <text x="600" y="260" textAnchor="middle" fill="#e5e7eb" fontSize="14" fontWeight="600">Node 4</text>
            </svg>
            <div style={styles.overlay}>
              <div style={styles.placeholderContent}>
                <p style={styles.placeholderTitle}>Cosmic Network Map</p>
                <p style={styles.placeholderSubtitle}>
                  Enter a GitHub username to map community constellations
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ForceGraph2D visualization */}
        {graphData && !loading && !error && graphData.nodes && graphData.nodes.length > 0 && (
          <>
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              nodeLabel={(node) => {
                // Show username and community name on hover
                return node.group_name 
                  ? `${node.id}\nCommunity: ${node.group_name}`
                  : `${node.id}\nCommunity: Group ${node.group}`;
              }}
              nodeColor={(node) => getNodeColor(node)}
              nodeVal={(node) => Math.sqrt(node.val || 1) * 3}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              linkColor={() => 'rgba(6, 182, 212, 0.25)'}
              linkWidth={1.5}
              linkDirectionalArrowLength={5}
              linkDirectionalArrowRelPos={1}
              backgroundColor="#000814"
              width={dimensions.width}
              height={dimensions.height}
              cooldownTicks={100}
              onEngineStop={() => {
                // Zoom to fit after engine stops (graph stabilized)
                if (fgRef.current) {
                  fgRef.current.zoomToFit(400, 50);
                }
              }}
            />
            {/* Custom styled tooltip - ForceGraph2D native tooltip is enhanced via nodeLabel */}
            <style>{`
              /* Override default ForceGraph2D tooltip styles */
              canvas + div[style*="position: absolute"] {
                background: rgba(0, 15, 35, 0.95) !important;
                color: #e5e7eb !important;
                padding: 0.875rem 1.125rem !important;
                border-radius: 10px !important;
                font-size: 0.875rem !important;
                border: 1px solid rgba(6, 182, 212, 0.4) !important;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 20px rgba(6, 182, 212, 0.2) !important;
                white-space: pre-line !important;
                max-width: 250px !important;
                line-height: 1.5 !important;
                backdrop-filter: blur(12px) !important;
                pointer-events: none !important;
                z-index: 1000 !important;
              }
            `}</style>
          </>
        )}
      </div>
    </div>
  );
}

export default GraphView;
