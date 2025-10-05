import { useState, useEffect } from 'react';
import './AutoProcessingStatus.css';

function AutoProcessingStatus() {
  const [processingStatus, setProcessingStatus] = useState(null);
  const [lastProcessed, setLastProcessed] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    checkProcessingStatus();
    const interval = setInterval(checkProcessingStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const checkProcessingStatus = async () => {
    try {
      const response = await fetch('http://localhost:2000/api/ppe/status');
      if (response.ok) {
        const status = await response.json();
        setProcessingStatus(status);
        setIsMonitoring(true);
        
        // Check for recent results
        const resultsResponse = await fetch('http://localhost:2000/api/ppe/results/SITE_001');
        if (resultsResponse.ok) {
          const results = await resultsResponse.json();
          if (results.analysis_timestamp) {
            const analysisTime = new Date(results.analysis_timestamp);
            const now = new Date();
            const timeDiff = now - analysisTime;
            
            // If analysis was within last 5 minutes, show as recently processed
            if (timeDiff < 5 * 60 * 1000) {
              setLastProcessed({
                site_id: results.site_id,
                compliance_score: results.compliance_score,
                timestamp: analysisTime,
                violations: results.total_violations
              });
            }
          }
        }
      }
    } catch (error) {
      setIsMonitoring(false);
    }
  };

  if (!isMonitoring) {
    return null;
  }

  return (
    <div className="auto-processing-status">
      <div className="status-header">
        <h3>🤖 Automatic Video Processing</h3>
        <div className={`status-indicator ${processingStatus?.yolo_available ? 'active' : 'simulated'}`}>
          {processingStatus?.yolo_available ? '🟢 AI Active' : '🟡 Demo Mode'}
        </div>
      </div>
      
      <div className="status-content">
        <div className="monitoring-info">
          <div className="info-item">
            <span className="icon">📁</span>
            <span>Watching: construction_videos/</span>
          </div>
          <div className="info-item">
            <span className="icon">🎬</span>
            <span>Formats: MP4, AVI, MOV, MKV</span>
          </div>
          <div className="info-item">
            <span className="icon">⚡</span>
            <span>Status: Ready for new videos</span>
          </div>
        </div>

        {lastProcessed && (
          <div className="last-processed">
            <h4>📊 Latest Analysis</h4>
            <div className="processed-item">
              <div className="processed-header">
                <span className="site-id">{lastProcessed.site_id}</span>
                <span className="timestamp">
                  {lastProcessed.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="processed-stats">
                <div className="stat">
                  <span className="stat-value">{lastProcessed.compliance_score}%</span>
                  <span className="stat-label">Compliance</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{lastProcessed.violations}</span>
                  <span className="stat-label">Violations</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="instructions">
          <h4>💡 How to Process Videos</h4>
          <ol>
            <li>Drop video files into <code>construction_videos/</code> folder</li>
            <li>Videos are automatically analyzed for PPE compliance</li>
            <li>Results appear in dashboard within seconds</li>
            <li>Check <code>ppe_results/</code> for detailed reports</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default AutoProcessingStatus;