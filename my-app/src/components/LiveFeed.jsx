import { useState, useEffect } from 'react';
import './LiveFeed.css';

function LiveFeed({ isOpen, onClose, siteId, siteName }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    if (isOpen) {
      checkServerStatus();
    }
  }, [isOpen]);

  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:2000/health');
      if (response.ok) {
        setServerStatus('connected');
        setIsLoading(false);
      } else {
        setServerStatus('error');
        setError('Server not responding');
      }
    } catch (err) {
      setServerStatus('error');
      setError('Cannot connect to video server. Make sure Flask server is running on port 2000.');
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setError('Failed to load video stream');
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="live-feed-overlay">
      <div className="live-feed-modal">
        <div className="live-feed-header">
          <h2>🔴 Live Feed - {siteName}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="live-feed-content">
          {serverStatus === 'checking' && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Connecting to video server...</p>
            </div>
          )}

          {serverStatus === 'error' && (
            <div className="error-state">
              <div className="error-icon">📹</div>
              <h3>Video Server Offline</h3>
              <p>{error}</p>
              <div className="server-instructions">
                <h4>To start the video server:</h4>
                <ol>
                  <li>Open terminal and navigate to: <code>/Users/aayushpatel/Desktop/RU Hack/flask-video-server/</code></li>
                  <li>Install dependencies: <code>pip install -r requirements.txt</code></li>
                  <li>Run server: <code>python app.py</code></li>
                </ol>
              </div>
              <button className="retry-btn" onClick={checkServerStatus}>
                🔄 Retry Connection
              </button>
            </div>
          )}

          {serverStatus === 'connected' && (
            <div className="video-container">
              {isLoading && (
                <div className="video-loading">
                  <div className="spinner"></div>
                  <p>Loading video stream...</p>
                </div>
              )}
              
              <img
                src={`http://localhost:2000/video_feed/${siteId}?t=${Date.now()}`}
                alt={`Live feed from ${siteName}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: isLoading ? 'none' : 'block' }}
                className="video-stream"
              />
              
              <div className="video-controls">
                <div className="stream-info">
                  <span className="live-indicator">🔴 LIVE</span>
                  <span className="site-info">Site ID: {siteId}</span>
                </div>
                
                <div className="control-buttons">
                  <button className="control-btn">📸 Capture</button>
                  <button className="control-btn">⏺️ Record</button>
                  <button className="control-btn">⚠️ Report Issue</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveFeed;