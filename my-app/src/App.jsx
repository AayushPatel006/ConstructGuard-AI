import { useState, useEffect } from 'react'
import Login from './components/Login'
import MapView from './components/SiteMap'
import LiveFeed from './components/LiveFeed'
import Alerts from './components/Alerts'
// import AutoProcessingStatus from './components/AutoProcessingStatus'
import './App.css'
import logo from './assets/logo.jpg'

function App() {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedSite, setSelectedSite] = useState(null)
  const [showLiveFeed, setShowLiveFeed] = useState(false)
  const [liveFeedSite, setLiveFeedSite] = useState(null)
  const [showAlerts, setShowAlerts] = useState(false)
  const [alertsSite, setAlertsSite] = useState(null)
  const [sites, setSites] = useState([])
  const [dashboardSummary, setDashboardSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const handleAlertsOpen = (site = null) => {
    setAlertsSite(site)
    setShowAlerts(true)
  }

  const handleAlertsClose = () => {
    setShowAlerts(false)
    setAlertsSite(null)
  }

  // Fetch sites data from backend
  const fetchSitesData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch sites with alert counts
      const sitesResponse = await fetch('http://localhost:2000/api/sites')
      if (!sitesResponse.ok) {
        throw new Error('Failed to fetch sites data')
      }
      const sitesData = await sitesResponse.json()
      
      // Fetch dashboard summary
      const summaryResponse = await fetch('http://localhost:2000/api/dashboard/summary')
      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch dashboard summary')
      }
      const summaryData = await summaryResponse.json()
      
      // Transform the data to match the expected format
      const transformedSites = sitesData.sites.map((site, index) => {
        // Map site IDs to numeric IDs for consistency
        const numericId = index + 1
        
        // Determine color based on risk level
        let color = 'light green'
        let status = site.riskLevel
        if (site.riskLevel === 'High') {
          color = 'light red'
          status = 'High Risk'
        } else if (site.riskLevel === 'Moderate') {
          color = 'light orange'
        } else if (site.riskLevel === 'Low') {
          status = 'Low Risk'
        }
        
        // Calculate additional metrics
        const violations = site.alertCounts.critical + Math.floor(site.alertCounts.warning / 2)
        const premiumImpact = site.riskScore > 7 ? Math.floor(site.riskScore * 2) : 
                             site.riskScore > 5 ? Math.floor(site.riskScore - 5) : 
                             -Math.floor((10 - site.riskScore) * 1.5)
        
        // Format last check time
        const lastCheck = new Date(site.lastCheck)
        const now = new Date()
        const diffMinutes = Math.floor((now - lastCheck) / (1000 * 60))
        const lastInspection = diffMinutes < 60 ? `${diffMinutes} min ago` : 
                              diffMinutes < 1440 ? `${Math.floor(diffMinutes / 60)} hour${Math.floor(diffMinutes / 60) > 1 ? 's' : ''} ago` : 
                              `${Math.floor(diffMinutes / 1440)} day${Math.floor(diffMinutes / 1440) > 1 ? 's' : ''} ago`
        
        return {
          id: numericId,
          name: site.name,
          location: site.location,
          riskScore: site.riskScore,
          compliance: site.compliance,
          violations: violations,
          premiumImpact: premiumImpact,
          status: status,
          color: color,
          workers: site.workers,
          lastInspection: lastInspection,
          aiCameras: site.aiCameras,
          activeAlerts: site.alertCounts.total,
          originalId: site.id // Keep original ID for API calls
        }
      })
      
      setSites(transformedSites)
      setDashboardSummary(summaryData)
      
    } catch (err) {
      console.error('Error fetching sites data:', err)
      setError(err.message)
      
      // Fallback to show empty state rather than crash
      setSites([])
      setDashboardSummary(null)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when component mounts and user logs in
  useEffect(() => {
    if (isLoggedIn) {
      fetchSitesData()
    }
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo"><img src={logo} alt="ConstructGuard-AI Logo" width={70}/></div>
            <div>
              <h1>ConstructGuard-AI</h1>
              <p>AI-Powered Construction Safety Analytics</p>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button 
            className="alerts-btn" 
            onClick={() => handleAlertsOpen()}
            title="View All Alerts"
          >
            🚨 Alerts ({sites.reduce((sum, site) => sum + site.activeAlerts, 0)})
          </button>
          <span className="user-info">Welcome, {user?.email}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <div className="dashboard-container">
          {/* Loading State */}
          {loading && (
            <div className="loading-dashboard">
              <div className="loading-spinner"></div>
              <h2>Loading ConstructGuard-AI Dashboard...</h2>
              <p>Fetching real-time construction site data</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="error-dashboard">
              <div className="error-icon">⚠️</div>
              <h2>Unable to Load Dashboard Data</h2>
              <p>{error}</p>
              <p>Make sure the Flask server is running on port 2000</p>
              <button className="retry-btn" onClick={fetchSitesData}>
                🔄 Retry Loading Data
              </button>
            </div>
          )}

          {/* Dashboard Content */}
          {!loading && !error && (
            <>
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
                    <div className="card-value">
                      {dashboardSummary ? dashboardSummary.summary.averageRiskScore : 0}
                      <span className="unit">/10</span>
                    </div>
                    <div className="card-trend good">Real-time monitoring</div>
                  </div>
                </div>
                
                <div className="summary-card active-sites">
                  <div className="card-icon">🏗️</div>
                  <div className="card-content">
                    <h3>Active Sites</h3>
                    <div className="card-value">
                      {dashboardSummary ? dashboardSummary.summary.totalSites : sites.length}
                    </div>
                    <div className="card-trend neutral">
                      {dashboardSummary ? dashboardSummary.summary.totalWorkers : 0} workers
                    </div>
                  </div>
                </div>
                
                <div className="summary-card compliance">
                  <div className="card-icon">✅</div>
                  <div className="card-content">
                    <h3>Average Compliance</h3>
                    <div className="card-value">
                      {dashboardSummary ? dashboardSummary.summary.averageCompliance : 0}
                      <span className="unit">%</span>
                    </div>
                    <div className="card-trend good">AI-verified</div>
                  </div>
                </div>
                
                <div className="summary-card premium">
                  <div className="card-icon">🎯</div>
                  <div className="card-content">
                    <h3>AI Cameras Active</h3>
                    <div className="card-value">
                      {dashboardSummary ? dashboardSummary.summary.totalCameras : 0}
                    </div>
                    <div className="card-trend excellent">24/7 monitoring</div>
                  </div>
                </div>
                
                <div className="summary-card alerts">
                  <div className="card-icon">⚠️</div>
                  <div className="card-content">
                    <h3>Total Active Alerts</h3>
                    <div className="card-value">
                      {dashboardSummary ? dashboardSummary.alerts.total : sites.reduce((sum, site) => sum + site.activeAlerts, 0)}
                    </div>
                    <div className="card-trend warning">
                      {dashboardSummary ? dashboardSummary.alerts.critical : 0} critical
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto Processing Status */}
              {/* <AutoProcessingStatus /> */}

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
                  <button 
                    className="action-btn warning" 
                    onClick={() => handleAlertsOpen(selectedSite.originalId || selectedSite.id)}
                  >
                    🚨 View Alerts
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
              {/* <div className="site-incidents">
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
              </div> */}

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
                      <div className="ppe-bar moderate" style={{width: '88%'}}></div>
                    </div>
                  </div>
                  
                  <div className="ppe-item">
                    <div className="ppe-icon">😷</div>
                    <div className="ppe-info">
                      <span className="ppe-name">Safety Mask</span>
                      <span className="ppe-percentage">74%</span>
                    </div>
                    <div className="ppe-progress">
                      <div className="ppe-bar warning" style={{width: '74%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Site Location Map */}
              <MapView />
            </div>
          )}
        </>
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

      {/* Alerts Modal */}
      <Alerts
        isOpen={showAlerts}
        onClose={handleAlertsClose}
        siteId={alertsSite}
      />
    </div>
  )
}

export default App;