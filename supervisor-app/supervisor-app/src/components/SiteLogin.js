import React, { useState } from 'react';
import './SiteLogin.css';

const SiteLogin = ({ sites, onSiteSelect }) => {
  const [selectedSiteId, setSelectedSiteId] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (selectedSiteId) {
      onSiteSelect(selectedSiteId);
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'moderate': return '#fd7e14';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className="site-login-container">
      <div className="site-login-header">
        <h1>🏗️ ConstructGuard AI</h1>
        <p>Supervisor Mobile Portal</p>
      </div>
      
      <form className="site-login-form" onSubmit={handleLogin}>
        <h2>Select Construction Site</h2>
        
        <div className="sites-grid">
          {sites.map((site) => (
            <div 
              key={site.id}
              className={`site-card ${selectedSiteId === site.id ? 'selected' : ''}`}
              onClick={() => setSelectedSiteId(site.id)}
            >
              <div className="site-header">
                <h3>{site.name}</h3>
                <span 
                  className="risk-badge"
                  style={{ backgroundColor: getRiskLevelColor(site.riskLevel) }}
                >
                  {site.riskLevel}
                </span>
              </div>
              
              <div className="site-details">
                <p className="location">📍 {site.location}</p>
                <div className="site-stats">
                  <div className="stat">
                    <span className="stat-value">{site.workers}</span>
                    <span className="stat-label">Workers</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{site.aiCameras}</span>
                    <span className="stat-label">Cameras</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{site.compliance}%</span>
                    <span className="stat-label">Compliance</span>
                  </div>
                </div>
                
                <div className="alert-summary">
                  {site.alerts.critical.length > 0 && (
                    <span className="alert-count critical">
                      🚨 {site.alerts.critical.length} Critical
                    </span>
                  )}
                  {site.alerts.warning.length > 0 && (
                    <span className="alert-count warning">
                      ⚠️ {site.alerts.warning.length} Warning
                    </span>
                  )}
                  {site.alerts.info.length > 0 && (
                    <span className="alert-count info">
                      ℹ️ {site.alerts.info.length} Info
                    </span>
                  )}
                  {site.alerts.critical.length === 0 && 
                   site.alerts.warning.length === 0 && 
                   site.alerts.info.length === 0 && (
                    <span className="alert-count safe">✅ All Clear</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          type="submit" 
          className="login-button"
          disabled={!selectedSiteId}
        >
          Access Site Dashboard
        </button>
      </form>
      
      <div className="app-info">
        <p>Real-time AI-powered construction safety monitoring</p>
      </div>
    </div>
  );
};

export default SiteLogin;