import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ site, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleImageClick = (imageSrc, alertType) => {
    setSelectedImage({ src: imageSrc, type: alertType });
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape' && selectedImage) {
        closeImageModal();
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'moderate': return '#fd7e14';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getAlertIcon = (type) => {
    const iconMap = {
      'NoHelmetDetected': '⛑️',
      "NoSafetyGearsDetected": "🦺",
      'SlipFallDetected': '🚨',
      'ProximityViolation': '⚠️',
      'SafetyVestMissing': '🦺',
      'UnauthorizedEntry': '🚪',
      'UnsafeProximity': '📏',
      'LowLightDetected': '💡',
      'CameraOffline': '📹',
      'SystemCheck': '✅',
      'EquipmentCheck': '🔧'
    };
    return iconMap[type] || '🔔';
  };

  const getCustomAlertMessage = (type) => {
    const messageMap = {
      'NoHelmetDetected': 'No Helmet Detected',
      "NoSafetyGearsDetected": "No Safety Gears",
      'SlipFallDetected': 'Slip/Fall Detected',
      'ProximityViolation': 'Proximity Violation',
      'SafetyVestMissing': 'Safety Vest Missing',
      'UnauthorizedEntry': 'Unauthorized Entry',
      'UnsafeProximity': 'Unsafe Proximity',
      'LowLightDetected': 'Low Light Detected',
      'CameraOffline': 'Camera Offline',
      'SystemCheck': 'System Check',
      'EquipmentCheck': 'Equipment Check'
    };
    return messageMap[type] || type.replace(/([A-Z])/g, ' $1').trim();
  };

  const allAlerts = [
    ...site.alerts.critical.map(alert => ({ ...alert, priority: 'critical' })),
    ...site.alerts.warning.map(alert => ({ ...alert, priority: 'warning' })),
    ...site.alerts.info.map(alert => ({ ...alert, priority: 'info' }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const totalAlerts = allAlerts.length;
  const criticalCount = site.alerts.critical.length;
  const warningCount = site.alerts.warning.length;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-top">
          <button className="logout-btn" onClick={onLogout}>
            ← Back
          </button>
          <button 
            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`} 
            onClick={handleRefresh}
          >
            🔄
          </button>
        </div>
        
        <div className="site-info">
          <h1>{site.name}</h1>
          <p className="location">📍 {site.location}</p>
          <div className="last-update">
            Last updated: {formatTime(currentTime)}
          </div>
        </div>
        
        <div 
          className="risk-indicator"
          style={{ backgroundColor: getRiskLevelColor(site.riskLevel) }}
        >
          <span className="risk-level">{site.riskLevel} Risk</span>
          <span className="risk-score">{site.riskScore}/10</span>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">👷</div>
          <div className="stat-info">
            <span className="stat-number">{site.workers}</span>
            <span className="stat-label">Active Workers</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📹</div>
          <div className="stat-info">
            <span className="stat-number">{site.aiCameras}</span>
            <span className="stat-label">AI Cameras</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-number">{site.compliance}%</span>
            <span className="stat-label">Compliance</span>
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="alert-summary-section">
        <h2>Alert Overview</h2>
        <div className="alert-summary-cards">
          <div className="summary-card critical">
            <div className="summary-count">{criticalCount}</div>
            <div className="summary-label">Critical</div>
          </div>
          <div className="summary-card warning">
            <div className="summary-count">{warningCount}</div>
            <div className="summary-label">Warnings</div>
          </div>
          <div className="summary-card total">
            <div className="summary-count">{totalAlerts}</div>
            <div className="summary-label">Total Alerts</div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="alerts-section">
        <h2>Recent Alerts</h2>
        
        {totalAlerts === 0 ? (
          <div className="no-alerts">
            <div className="no-alerts-icon">✅</div>
            <h3>All Clear!</h3>
            <p>No active alerts for this site</p>
          </div>
        ) : (
          <div className="alerts-list">
            {allAlerts.map((alert) => (
              <div key={alert.id} className={`alert-item ${alert.priority}`}>
                <div className="alert-header">
                  <div className="alert-icon">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="alert-meta">
                    <span className="alert-type">{getCustomAlertMessage(alert.type)}</span>
                    <span className="alert-time">{getTimeAgo(alert.timestamp)}</span>
                  </div>
                  <div className={`alert-priority-badge ${alert.priority}`}>
                    {alert.priority.toUpperCase()}
                  </div>
                </div>
                
                {alert.image && (
                  <div className="alert-image-container">
                    <img 
                      src={alert.image} 
                      alt={`${alert.type} - Alert evidence captured by AI camera`}
                      className="alert-image"
                      loading="lazy"
                      onClick={() => handleImageClick(alert.image, alert.type)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        console.log('Failed to load image for alert:', alert.id);
                      }}
                      onLoad={(e) => {
                        e.target.style.opacity = '1';
                      }}
                      style={{ opacity: '0', transition: 'opacity 0.3s ease' }}
                    />
                    <div className="image-overlay">
                      <span className="image-overlay-text">Tap to view full size</span>
                    </div>
                  </div>
                )}
                
                <div className="alert-description">
                  {alert.description}
                </div>
                
                <div className="alert-footer">
                  <span className="timestamp">
                    {formatDate(alert.timestamp)} at {formatTime(alert.timestamp)}
                  </span>
                </div>
                
                {alert.emailSent && (
                  <div className="email-notification">
                    <div className="email-header">
                      <span className="email-icon">📧</span>
                      <span className="email-title">Email Notification Sent</span>
                    </div>
                    <div className="email-content">
                      {alert.emailSent.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          {index < alert.emailSent.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>ConstructGuard AI - Real-time Safety Monitoring</p>
        <p>Site ID: {site.id}</p>
      </footer>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={closeImageModal}>
              ✕
            </button>
            <img 
              src={selectedImage.src} 
              alt={`Full size view - ${selectedImage.type}`}
              className="image-modal-img"
            />
            <div className="image-modal-caption">
              {getCustomAlertMessage(selectedImage.type)} - AI Detection
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;