import { useEffect, useRef } from "react";
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
        id: 1,
        name: "Downtown Plaza Construction",
        location: "New York, NY",
        coordinates: [-74.006, 40.7128],
        status: "Active",
        riskScore: 6.5,
        compliance: 94,
        activeAlerts: 2
      },
      {
        id: 2,
        name: "Riverside Complex",
        location: "Chicago, IL",
        coordinates: [-87.6298, 41.8781],
        status: "Active",
        riskScore: 4.2,
        compliance: 98,
        activeAlerts: 0
      },
      {
        id: 3,
        name: "Tech Hub Center",
        location: "Austin, TX",
        coordinates: [-97.7431, 30.2672],
        status: "On Hold",
        riskScore: 8.1,
        compliance: 87,
        activeAlerts: 3
      },
      {
        id: 4,
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
        alert(`Site: ${site.name}\nLocation: ${site.location}\nStatus: ${site.status}\nRisk Score: ${site.riskScore}/10\nCompliance: ${site.compliance}%`);
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
