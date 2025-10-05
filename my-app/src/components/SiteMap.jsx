import { useEffect, useRef, useState } from "react";
import "./SiteMap.css";

export default function MapView() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // ensure the div is mounted and we haven't already initialized
    // if (!mapContainerRef.current || mapRef.current) return;

    // Use the global maplibregl from CDN
    const map = new window.maplibregl.Map({
      container: mapContainerRef.current, // pass the DOM element, not the ref
      style: "https://demotiles.maplibre.org/style.json", // working public style
      center: [-100, 38.62], // starting position [lng, lat] - using your working coordinates
      zoom: 3 // starting zoom
    });

    // Add navigation controls to the map
    map.addControl(new window.maplibregl.NavigationControl());

    // Wait for map to load before adding markers
    map.on('load', () => {
      addConstructionSiteMarkers(map);
    });

    mapRef.current = map;

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Function to add construction site markers
  const addConstructionSiteMarkers = (map) => {
    // Construction site data
    const constructionSites = [
      {
        id: "SITE_001",
        name: "Downtown Plaza Construction",
        location: "New York, NY",
        coordinates: [-74.006, 40.7128],
        status: "Active",
        riskScore: 6.5,
        compliance: 94,
        activeAlerts: 2
      },
      {
        id: "SITE_002",
        name: "Riverside Complex",
        location: "Chicago, IL",
        coordinates: [-87.6298, 41.8781],
        status: "Active",
        riskScore: 4.2,
        compliance: 98,
        activeAlerts: 0
      },
      {
        id: "SITE_003",
        name: "Tech Hub Center",
        location: "Austin, TX",
        coordinates: [-97.7431, 30.2672],
        status: "On Hold",
        riskScore: 8.1,
        compliance: 87,
        activeAlerts: 3
      },
      {
        id: "SITE_004",
        name: "Harbor Bridge Project",
        location: "San Francisco, CA",
        coordinates: [-122.4194, 37.7749],
        status: "Under Review",
        riskScore: 5.8,
        compliance: 91,
        activeAlerts: 1
      }
    ];

    constructionSites.forEach(site => {
      // Create a simple marker with text
      const markerElement = document.createElement('div');
      markerElement.className = 'simple-marker';
      markerElement.style.cssText = `
        background: white;
        border: 3px solid #16a34a;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        position: relative;
      `;
      markerElement.innerHTML = '🏗️';

      // Create a text label
      const labelElement = document.createElement('div');
      labelElement.style.cssText = `
        position: absolute;
        top: 45px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        color: #333;
        white-space: nowrap;
        box-shadow: 0 1px 5px rgba(0,0,0,0.2);
        border: 1px solid #ccc;
      `;
      labelElement.textContent = site.name;
      markerElement.appendChild(labelElement);

      // Add status indicator
      if (site.activeAlerts > 0) {
        const alertBadge = document.createElement('div');
        alertBadge.style.cssText = `
          position: absolute;
          top: -8px;
          right: -8px;
          background: red;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
        `;
        alertBadge.textContent = site.activeAlerts;
        markerElement.appendChild(alertBadge);
      }

      // Create marker and add to map
      const marker = new window.maplibregl.Marker(markerElement)
        .setLngLat(site.coordinates)
        .addTo(map);

      // Add click event
      markerElement.addEventListener('click', () => {
        // Create popup content with site information
        const popupHTML = `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${site.name}</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Location:</strong> ${site.location}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> ${site.status}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Risk Score:</strong> ${site.riskScore}/10</p>
            <p style="margin: 5px 0; color: #666;"><strong>Compliance:</strong> ${site.compliance}%</p>
            <div style="margin-top: 10px; padding: 8px; background: #f0f9ff; border-radius: 6px; border-left: 4px solid #0369a1;">
              <small style="color: #0369a1; font-weight: 600;">
                🤖 Auto-Processing: Videos dropped in folder are analyzed automatically
              </small>
            </div>
          </div>
        `;

        const popup = new window.maplibregl.Popup({ closeOnClick: false })
          .setLngLat(site.coordinates)
          .setHTML(popupHTML)
          .addTo(map);

        map.flyTo({
          center: site.coordinates,
          zoom: 10,
          essential: true
        });
      });
    });
  };

  // Return the JSX here, not inside useEffect
  return (
    <div 
      ref={mapContainerRef} 
      style={{ height: "400px" }}
    />
  );
}
