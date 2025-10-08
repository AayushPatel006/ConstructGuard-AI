import React, { useState, useEffect } from 'react';
import './App.css';
import SiteLogin from './components/SiteLogin';
import Dashboard from './components/Dashboard';

// Import alert images
import img1 from './images/img1.jpeg';
import img2 from './images/img2.jpeg';
import img3 from './images/img3.jpeg';

function App() {
  const [selectedSite, setSelectedSite] = useState(null);
  const [alertsData, setAlertsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from your Flask API
    // For now, we'll simulate loading the alerts data
    const loadAlertsData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - in production, fetch from your Flask server
        const mockData = {
          "sites": [
            {
              "id": "SITE_001",
              "name": "Downtown Plaza",
              "location": "New York, NY",
              "riskLevel": "High",
              "riskScore": 8.1,
              "compliance": 76,
              "workers": 45,
              "aiCameras": 12,
              "lastCheck": "2025-10-04T10:00:00Z",
              "alerts": {
                "critical": [
                  {
                    "id": "A101",
                    "type": "NoSafetyGearsDetected",
                    "timestamp": "2025-10-04T09:45:12Z",
                    "confidence": 0.96,
                    "image": img1,
                    "emailSent": "Subject: Critical Safety Alert – No Safety Gears Detected\n\nDear Zone B Manager,\n\nThis is to notify you of a critical safety alert flagged by the AI monitoring system.\n\nAlert: No Safety Gears Detected\nSeverity: Critical\nCaptured On: October 4, 05:55 AM\nLocation: Zone B\nReference: AI camera detection evidence available (screenshot attached).\n\nImmediate action is required to ensure compliance with safety protocols and to prevent recurrence. Please investigate the incident, identify the personnel involved, and confirm the corrective measures taken.\n\nKindly provide your report on this matter at the earliest.\n\nBest regards\n\nSupervisor"
                  },
                  {
                    "id": "A102",
                    "type": "NoHelmetDetected",
                    "timestamp": "2025-10-04T09:20:03Z",
                    "confidence": 0.94,
                    "image": img2,
                    "emailSent": "Subject: URGENT - No Helmet Detected on Construction Site\n\nDear Site Safety Coordinator,\n\nThis is an immediate safety alert from the AI monitoring system.\n\n🚨 ALERT DETAILS:\nViolation: Worker without helmet detected\nSeverity: CRITICAL\nTime: October 4, 09:20 AM\nZone: Scaffolding Area\nAI Confidence: 94%\n\nIMMEDIATE ACTIONS REQUIRED:\n• Stop work in the affected area\n• Locate and provide helmet to worker\n• Conduct safety briefing\n• Document corrective measures\n\nHead protection is mandatory in all construction zones. This violation poses serious risk of head injury.\n\nPlease confirm actions taken within 30 minutes.\n\nRegards,\nConstructGuard AI Safety System"
                  },
                  {
                    "id": "A103",
                    "type": "NoSafetyGearsDetected",
                    "timestamp": "2025-10-04T09:55:45Z",
                    "confidence": 0.89,
                    "image": img3,
                    "emailSent": "Subject: Safety Compliance Alert - Multiple PPE Violations Detected\n\nDear Zone Supervisor,\n\nCritical safety equipment violations have been identified by our AI monitoring system.\n\n⚠️ VIOLATION SUMMARY:\nIssue: Multiple safety gear items missing\nDetected: October 4, 09:55 AM\nLocation: Construction Zone C\nWorker Count: 1\nConfidence Level: 89%\n\nMISSING EQUIPMENT DETECTED:\n• Safety vest/high-visibility clothing\n• Protective gloves\n• Safety boots verification needed\n\nCOMPLIANCE ACTIONS:\n1. Immediately halt work activities\n2. Provide all required PPE to worker\n3. Re-verify safety checklist compliance\n4. Document incident in safety log\n5. Conduct refresher safety training\n\nThis violation affects our safety rating and regulatory compliance. Photo evidence has been captured and stored.\n\nResponse required within 15 minutes.\n\nConstructGuard AI Safety Team"
                  }
                ],
                "warning": [],
                "info": []
                
              }
            } 
          ]
        };
        
        setAlertsData(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading alerts data:', error);
        setLoading(false);
      }
    };

    loadAlertsData();
  }, []);

  const handleSiteSelect = (siteId) => {
    const site = alertsData?.sites.find(s => s.id === siteId);
    setSelectedSite(site);
  };

  const handleLogout = () => {
    setSelectedSite(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading ConstructGuard AI...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {!selectedSite ? (
        <SiteLogin 
          sites={alertsData?.sites || []} 
          onSiteSelect={handleSiteSelect} 
        />
      ) : (
        <Dashboard 
          site={selectedSite} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
}

export default App;
