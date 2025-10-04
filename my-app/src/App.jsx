import { useState } from 'react'
import Login from './components/Login'
import MapView from './components/SiteMap'
import LiveFeed from './components/LiveFeed'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedSite, setSelectedSite] = useState(null)
  const [showLiveFeed, setShowLiveFeed] = useState(false)
  const [liveFeedSite, setLiveFeedSite] = useState(null)

  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
  }

  const handleSiteSelect = (site) => {
    setSelectedSite(site)
  }

  const handleLiveFeedOpen = (site) => {
    setLiveFeedSite(site)
    setShowLiveFeed(true)
  }

  const handleLiveFeedClose = () => {
    setShowLiveFeed(false)
    setLiveFeedSite(null)
  }

  const sites = [
    {
      id: 1,
      name: "Downtown Plaza",
      location: "New York, NY",
      riskScore: 8.1,
      compliance: 76,
      violations: 7,
      premiumImpact: 15,
      status: "High Risk",
      color: "light red",
      workers: 45,
      lastInspection: "2 hours ago",
      aiCameras: 12,
      activeAlerts: 3
    },
    {
      id: 2,
      name: "Riverside Complex",
      location: "Chicago, IL",
      riskScore: 6.3,
      compliance: 92,
      violations: 2,
      premiumImpact: -8,
      status: "Moderate",
      color: "light orange",
      workers: 32,
      lastInspection: "1 hour ago",
      aiCameras: 8,
      activeAlerts: 1
    },
    {
      id: 3,
      name: "Tech Hub Center",
      location: "Austin, TX",
      riskScore: 4.2,
      compliance: 96,
      violations: 0,
      premiumImpact: -12,
      status: "Low Risk",
      color: "light green",
      workers: 28,
      lastInspection: "30 min ago",
      aiCameras: 6,
      activeAlerts: 0
    },
    {
      id: 4,
      name: "Harbor Bridge",
      location: "San Francisco, CA",
      riskScore: 7.0,
      compliance: 84,
      violations: 4,
      premiumImpact: 2,
      status: "Moderate",
      color: "light orange",
      workers: 38,
      lastInspection: "45 min ago",
      aiCameras: 10,
      activeAlerts: 2
    }
  ]

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo">🛡️</div>
            <div>
              <h1>ConstructGuard-AI</h1>
              <p>AI-Powered Construction Safety Analytics</p>
            </div>
          </div>
        </div>
        <div className="header-right">
          <span className="user-info">Welcome, {user?.email}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <div className="dashboard-container">
          {/* Navigation Bar */}
          <div className="dashboard-nav">
            <button 
              className={`nav-tab ${!selectedSite ? 'active' : ''}`}
              onClick={() => setSelectedSite(null)}
            >
              📊 Portfolio Overview
            </button>
            <div className="nav-divider"></div>
            <span className="nav-label">Individual Sites:</span>
            {sites.map(site => (
              <button
                key={site.id}
                className={`nav-tab site-tab ${selectedSite?.id === site.id ? 'active' : ''}`}
                onClick={() => handleSiteSelect(site)}
              >
                🏗️ {site.name}
                {site.activeAlerts > 0 && <span className="alert-badge">{site.activeAlerts}</span>}
              </button>
            ))}
          </div>

          {!selectedSite ? (
            // Portfolio Overview
            <>
              {/* Summary Cards */}
              <div className="summary-cards">
                <div className="summary-card risk-score">
                  <div className="card-icon">📊</div>
                  <div className="card-content">
                    <h3>Portfolio Risk Score</h3>
                    <div className="card-value">7.2<span className="unit">/10</span></div>
                    <div className="card-trend good">-0.3 from last month</div>
                  </div>
                </div>
                
                <div className="summary-card active-sites">
                  <div className="card-icon">🏗️</div>
                  <div className="card-content">
                    <h3>Active Sites</h3>
                    <div className="card-value">{sites.length}</div>
                    <div className="card-trend neutral">+2 new sites</div>
                  </div>
                </div>
                
                <div className="summary-card compliance">
                  <div className="card-icon">✅</div>
                  <div className="card-content">
                    <h3>Average Compliance</h3>
                    <div className="card-value">89<span className="unit">%</span></div>
                    <div className="card-trend good">+3% this week</div>
                  </div>
                </div>
                
                <div className="summary-card premium">
                  <div className="card-icon">💰</div>
                  <div className="card-content">
                    <h3>Total Premium Adjustment</h3>
                    <div className="card-value">-12<span className="unit">%</span></div>
                    <div className="card-trend excellent">$2.4M savings</div>
                  </div>
                </div>
                
                <div className="summary-card alerts">
                  <div className="card-icon">⚠️</div>
                  <div className="card-content">
                    <h3>Total Active Alerts</h3>
                    <div className="card-value">{sites.reduce((sum, site) => sum + site.activeAlerts, 0)}</div>
                    <div className="card-trend warning">2 high priority</div>
                  </div>
                </div>
              </div>

              {/* Sites Grid Overview */}
              <div className="sites-grid">
                {sites.map(site => (
                  <div 
                    key={site.id} 
                    className="site-card" 
                    onClick={() => handleSiteSelect(site)}
                    style={{ backgroundColor: site.color }}
                  >
                    <div className="site-header">
                      <h3>{site.name}</h3>
                      <span className={`status-badge ${site.status.toLowerCase().replace(' ', '-')}`}>
                        {site.status}
                      </span>
                    </div>
                    <div className="site-location">{site.location}</div>
                    
                    <div className="site-metrics">
                      <div className="metric">
                        <span className="metric-label">Risk Score</span>
                        <span className={`metric-value ${site.riskScore > 7 ? 'high' : site.riskScore > 5 ? 'medium' : 'low'}`}>
                          {site.riskScore}
                        </span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Compliance</span>
                        <span className={`metric-value ${site.compliance > 90 ? 'excellent' : site.compliance > 80 ? 'good' : 'poor'}`}>
                          {site.compliance}%
                        </span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Workers</span>
                        <span className="metric-value">{site.workers}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">AI Cameras</span>
                        <span className="metric-value">{site.aiCameras}</span>
                      </div>
                    </div>
                    
                    <div className="site-footer">
                      <span className="last-inspection">Last check: {site.lastInspection}</span>
                      {site.activeAlerts > 0 && (
                        <span className="active-alerts">{site.activeAlerts} alerts</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Map */}
              <MapView />
            </>
          ) : (
            // Individual Site View
            <div className="site-detail-view">
              <div className="site-detail-header">
                <div className="site-info">
                  <h2>{selectedSite.name}</h2>
                  <p>{selectedSite.location}</p>
                  <span className={`status-badge ${selectedSite.status.toLowerCase().replace(' ', '-')}`}>
                    {selectedSite.status}
                  </span>
                </div>
                <div className="site-actions">
                  <button 
                    className="action-btn primary" 
                    onClick={() => handleLiveFeedOpen(selectedSite)}
                  >
                    📹 Live Feed
                  </button>
                  <button className="action-btn secondary">📊 Generate Report</button>
                  {/* <button className="action-btn secondary">⚙️ Configure Alerts</button> */}
                </div>
              </div>

              {/* Site-specific metrics */}
              <div className="site-metrics-detailed">
                <div className="metric-card">
                  <h4>Risk Assessment</h4>
                  <div className="large-metric">
                    <span className={`large-value ${selectedSite.riskScore > 7 ? 'high' : selectedSite.riskScore > 5 ? 'medium' : 'low'}`}>
                      {selectedSite.riskScore}
                    </span>
                    <span className="metric-unit">/10</span>
                  </div>
                  <div className="risk-breakdown">
                    <div className="risk-item">PPE Compliance: {selectedSite.compliance}%</div>
                    <div className="risk-item">Safety Violations: {selectedSite.violations}</div>
                    <div className="risk-item">Worker Density: Optimal</div>
                  </div>
                </div>

                <div className="metric-card">
                  <h4>Live Monitoring</h4>
                  <div className="monitoring-stats">
                    <div className="stat-item">
                      <span className="stat-icon">👷</span>
                      <span className="stat-value">{selectedSite.workers}</span>
                      <span className="stat-label">Active Workers</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">📹</span>
                      <span className="stat-value">{selectedSite.aiCameras}</span>
                      <span className="stat-label">AI Cameras</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">⚠️</span>
                      <span className="stat-value">{selectedSite.activeAlerts}</span>
                      <span className="stat-label">Active Alerts</span>
                    </div>
                  </div>
                </div>

                <div className="metric-card">
                  <h4>Premium Impact</h4>
                  <div className="premium-display">
                    <span className={`premium-value ${selectedSite.premiumImpact > 0 ? 'increase' : 'decrease'}`}>
                      {selectedSite.premiumImpact > 0 ? '+' : ''}{selectedSite.premiumImpact}%
                    </span>
                    <div className="premium-details">
                      {selectedSite.premiumImpact > 0 ? 
                        `+$${(selectedSite.premiumImpact * 1000).toLocaleString()} monthly increase` :
                        `$${Math.abs(selectedSite.premiumImpact * 1000).toLocaleString()} monthly savings`
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Site-specific alerts and incidents */}
              <div className="site-incidents">
                <h3>Recent Site Activity</h3>
                <div className="incidents-list">
                  <div className="incident-item high">
                    <div className="incident-time">2:34 PM</div>
                    <div className="incident-content">
                      <div className="incident-title">Worker without helmet - Zone C</div>
                      <div className="incident-description">AI detected worker not wearing required PPE</div>
                      <div className="incident-status unresolved">Action Required</div>
                    </div>
                    <div className="severity-tag high">CRITICAL</div>
                  </div>
                  
                  <div className="incident-item medium">
                    <div className="incident-time">1:15 PM</div>
                    <div className="incident-content">
                      <div className="incident-title">Equipment inspection due</div>
                      <div className="incident-description">Crane #3 requires safety inspection</div>
                      <div className="incident-status investigating">Scheduled</div>
                    </div>
                    <div className="severity-tag medium">WARNING</div>
                  </div>
                  
                  <div className="incident-item low">
                    <div className="incident-time">12:42 PM</div>
                    <div className="incident-content">
                      <div className="incident-title">Safety briefing completed</div>
                      <div className="incident-description">Morning safety meeting - 100% attendance</div>
                      <div className="incident-status resolved">Completed</div>
                    </div>
                    <div className="severity-tag low">INFO</div>
                  </div>
                </div>
              </div>

              {/* PPE Compliance for this site */}
              <div className="site-ppe-compliance">
                <h3>PPE Compliance Tracking</h3>
                <div className="ppe-grid">
                  <div className="ppe-item">
                    <div className="ppe-icon">⛑️</div>
                    <div className="ppe-info">
                      <span className="ppe-name">Hard Hats</span>
                      <span className="ppe-percentage">92%</span>
                    </div>
                    <div className="ppe-progress">
                      <div className="ppe-bar" style={{width: '92%'}}></div>
                    </div>
                  </div>
                  
                  <div className="ppe-item">
                    <div className="ppe-icon">🦺</div>
                    <div className="ppe-info">
                      <span className="ppe-name">Safety Vests</span>
                      <span className="ppe-percentage">88%</span>
                    </div>
                    <div className="ppe-progress">
                      <div className="ppe-bar" style={{width: '88%'}}></div>
                    </div>
                  </div>
                  
                  <div className="ppe-item">
                    <div className="ppe-icon">🧤</div>
                    <div className="ppe-info">
                      <span className="ppe-name">Work Gloves</span>
                      <span className="ppe-percentage">74%</span>
                    </div>
                    <div className="ppe-progress">
                      <div className="ppe-bar warning" style={{width: '74%'}}></div>
                    </div>
                  </div>
                  
                  <div className="ppe-item">
                    <div className="ppe-icon">🥾</div>
                    <div className="ppe-info">
                      <span className="ppe-name">Safety Boots</span>
                      <span className="ppe-percentage">95%</span>
                    </div>
                    <div className="ppe-progress">
                      <div className="ppe-bar" style={{width: '95%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Site Location Map */}
              <MapView />
            </div>
          )}
        </div>
      </main>

      {/* Live Feed Modal */}
      <LiveFeed
        isOpen={showLiveFeed}
        onClose={handleLiveFeedClose}
        siteId={liveFeedSite?.id}
        siteName={liveFeedSite?.name}
      />
    </div>
  )
}

export default App
