import { useState, useEffect } from 'react';
import './PPEDetection.css';

function PPEDetection({ siteId, siteName, isOpen, onClose }) {
  const [ppeResults, setPpeResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      checkSystemStatus();
      fetchPPEResults();
    }
  }, [isOpen, siteId]);

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('http://localhost:2000/api/ppe/status');
      if (response.ok) {
        const status = await response.json();
        setSystemStatus(status);
      }
    } catch (err) {
      console.error('Failed to check PPE system status:', err);
    }
  };

  const fetchPPEResults = async () => {
    if (!siteId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:2000/api/ppe/results/${siteId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch PPE results');
      }
      
      const data = await response.json();
      setPpeResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startAnalysis = async () => {
    if (!siteId) return;
    
    setAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:2000/api/ppe/analyze/${siteId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('PPE analysis failed');
      }
      
      const results = await response.json();
      setPpeResults(results);
      
      // Show success message
      setTimeout(() => {
        setAnalyzing(false);
      }, 2000);
      
    } catch (err) {
      setError(err.message);
      setAnalyzing(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getComplianceColor = (score) => {
    if (score >= 95) return 'excellent';
    if (score >= 85) return 'good';
    if (score >= 70) return 'warning';
    return 'poor';
  };

  if (!isOpen) return null;

  return (
    <div className="ppe-overlay">
      <div className="ppe-modal">
        <div className="ppe-header">
          <h2>🦺 PPE Compliance Analysis - {siteName}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="ppe-content">
          {/* System Status */}
          {systemStatus && (
            <div className="system-status">
              <h3>System Status</h3>
              <div className="status-grid">
                <div className={`status-item ${systemStatus.yolo_available ? 'available' : 'unavailable'}`}>
                  <span className="status-icon">{systemStatus.yolo_available ? '✅' : '❌'}</span>
                  <span>YOLO Detection</span>
                </div>
                <div className={`status-item ${systemStatus.model_loaded ? 'available' : 'unavailable'}`}>
                  <span className="status-icon">{systemStatus.model_loaded ? '✅' : '❌'}</span>
                  <span>Model Loaded</span>
                </div>
                <div className={`status-item ${systemStatus.imageio_available ? 'available' : 'unavailable'}`}>
                  <span className="status-icon">{systemStatus.imageio_available ? '✅' : '❌'}</span>
                  <span>Video Processing</span>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Controls */}
          <div className="analysis-controls">
            <button 
              className="analyze-btn"
              onClick={startAnalysis}
              disabled={analyzing}
            >
              {analyzing ? '🔄 Analyzing...' : '🎯 Start PPE Analysis'}
            </button>
            <button 
              className="refresh-btn"
              onClick={fetchPPEResults}
              disabled={loading}
            >
              🔄 Refresh Results
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading PPE analysis results...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Analysis Error</h3>
              <p>{error}</p>
            </div>
          )}

          {/* PPE Results */}
          {ppeResults && !loading && (
            <div className="ppe-results">
              {/* Compliance Score */}
              <div className="compliance-summary">
                <div className={`compliance-score ${getComplianceColor(ppeResults.compliance_score)}`}>
                  <h3>Compliance Score</h3>
                  <div className="score-circle">
                    <span className="score">{ppeResults.compliance_score}%</span>
                  </div>
                </div>
                
                <div className="analysis-info">
                  <h4>Analysis Details</h4>
                  <p><strong>Frames Processed:</strong> {ppeResults.total_frames_processed}</p>
                  <p><strong>Total Violations:</strong> {ppeResults.total_violations}</p>
                  <p><strong>Analysis Time:</strong> {formatTimestamp(ppeResults.analysis_timestamp)}</p>
                  {ppeResults.status === 'simulated_demo_data' && (
                    <p className="demo-note">📝 <em>This is simulated demo data</em></p>
                  )}
                </div>
              </div>

              {/* Violation Summary */}
              {ppeResults.summary && (
                <div className="violation-summary">
                  <h4>Violation Breakdown</h4>
                  <div className="violation-grid">
                    <div className="violation-item helmet">
                      <span className="violation-icon">⛑️</span>
                      <span className="violation-label">Helmet Violations</span>
                      <span className="violation-count">{ppeResults.summary.helmet_violations}</span>
                    </div>
                    <div className="violation-item vest">
                      <span className="violation-icon">🦺</span>
                      <span className="violation-label">Vest Violations</span>
                      <span className="violation-count">{ppeResults.summary.vest_violations}</span>
                    </div>
                    <div className="violation-item total">
                      <span className="violation-icon">⚠️</span>
                      <span className="violation-label">Total Violations</span>
                      <span className="violation-count">{ppeResults.summary.total_violations}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Alerts */}
              {ppeResults.alerts && ppeResults.alerts.length > 0 && (
                <div className="recent-alerts">
                  <h4>Recent PPE Violations</h4>
                  <div className="alerts-list">
                    {ppeResults.alerts.map((alert, index) => (
                      <div key={index} className="alert-item">
                        <div className="alert-icon">
                          {alert.type === 'NoHelmetDetected' ? '⛑️' : '🦺'}
                        </div>
                        <div className="alert-content">
                          <h5>{alert.type.replace(/([A-Z])/g, ' $1').trim()}</h5>
                          <p>{alert.description}</p>
                          <div className="alert-meta">
                            <span>🕐 {formatTimestamp(alert.timestamp)}</span>
                            <span>🎯 {Math.round(alert.confidence * 100)}% confidence</span>
                            {alert.frame && <span>📽️ Frame {alert.frame}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Actions */}
              <div className="analysis-actions">
                <button className="action-btn export">📊 Export Report</button>
                <button className="action-btn schedule">⏰ Schedule Regular Analysis</button>
                <button className="action-btn settings">⚙️ Configure Detection</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PPEDetection;