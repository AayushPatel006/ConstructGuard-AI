import { useState, useEffect } from 'react';
import './Alerts.css';

function Alerts({ siteId = null, isOpen, onClose }) {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen, siteId]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = siteId 
        ? `http://localhost:2000/api/alerts/${siteId}`
        : 'http://localhost:2000/api/alerts';
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      
      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getAlertIcon = (type) => {
    const icons = {
      'NoHelmetDetected': '⛑️',
      'SlipFallDetected': '⚠️',
      'ProximityViolation': '🚨',
      'LowLightDetected': '💡',
      'SafetyVestMissing': '🦺',
      'CameraOffline': '📹',
      'SystemCheck': '✅',
      'UnauthorizedEntry': '🚫',
      'UnsafeProximity': '⚠️',
      'EquipmentCheck': '🔧'
    };
    return icons[type] || '⚠️';
  };

  const getAllAlerts = () => {
    if (!alerts) return [];
    
    if (siteId) {
      // Single site alerts
      const allAlerts = [
        ...alerts.alerts.critical.map(alert => ({ ...alert, severity: 'critical' })),
        ...alerts.alerts.warning.map(alert => ({ ...alert, severity: 'warning' })),
        ...alerts.alerts.info.map(alert => ({ ...alert, severity: 'info' }))
      ];
      return allAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else {
      // All sites alerts
      const allAlerts = [];
      alerts.sites.forEach(site => {
        ['critical', 'warning', 'info'].forEach(severity => {
          site.alerts[severity].forEach(alert => {
            allAlerts.push({
              ...alert,
              severity,
              siteName: site.name,
              siteId: site.id
            });
          });
        });
      });
      return allAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
  };

  const filterAlerts = (alerts) => {
    if (selectedType === 'all') return alerts;
    return alerts.filter(alert => alert.severity === selectedType);
  };

  if (!isOpen) return null;

  return (
    <div className="alerts-overlay">
      <div className="alerts-modal">
        <div className="alerts-header">
          <h2>
            🚨 Safety Alerts
            {siteId && alerts && ` - ${alerts.name}`}
          </h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="alerts-content">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading alerts...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Failed to Load Alerts</h3>
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchAlerts}>
                🔄 Retry
              </button>
            </div>
          )}

          {alerts && !loading && (
            <>
              {/* Alert Type Filter */}
              <div className="alert-filters">
                <button 
                  className={`filter-btn ${selectedType === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedType('all')}
                >
                  All Alerts
                </button>
                <button 
                  className={`filter-btn critical ${selectedType === 'critical' ? 'active' : ''}`}
                  onClick={() => setSelectedType('critical')}
                >
                  Critical
                </button>
                <button 
                  className={`filter-btn warning ${selectedType === 'warning' ? 'active' : ''}`}
                  onClick={() => setSelectedType('warning')}
                >
                  Warning
                </button>
                <button 
                  className={`filter-btn info ${selectedType === 'info' ? 'active' : ''}`}
                  onClick={() => setSelectedType('info')}
                >
                  Info
                </button>
              </div>

              {/* Alerts List */}
              <div className="alerts-list">
                {filterAlerts(getAllAlerts()).map(alert => (
                  <div key={alert.id} className={`alert-item ${alert.severity}`}>
                    <div className="alert-icon">
                      {getAlertIcon(alert.type)}
                    </div>
                    
                    <div className="alert-content">
                      <div className="alert-header">
                        <h4 className="alert-type">{alert.type.replace(/([A-Z])/g, ' $1').trim()}</h4>
                        <span className={`alert-badge ${alert.severity}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="alert-description">{alert.description}</p>
                      
                      <div className="alert-meta">
                        <span className="alert-time">
                          🕐 {formatTimestamp(alert.timestamp)}
                        </span>
                        <span className="alert-confidence">
                          🎯 {Math.round(alert.confidence * 100)}% confidence
                        </span>
                        {alert.siteName && (
                          <span className="alert-site">
                            📍 {alert.siteName}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="alert-actions">
                      <button className="action-btn acknowledge">✓ Acknowledge</button>
                      <button className="action-btn details">👁️ Details</button>
                    </div>
                  </div>
                ))}

                {filterAlerts(getAllAlerts()).length === 0 && (
                  <div className="no-alerts">
                    <div className="no-alerts-icon">✅</div>
                    <h3>No {selectedType === 'all' ? '' : selectedType} alerts</h3>
                    <p>All systems are operating normally.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Alerts;