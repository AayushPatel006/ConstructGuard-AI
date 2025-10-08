# ConstructGuard AI - Supervisor Mobile Portal

A mobile-first React application for construction site supervisors to monitor real-time safety alerts and site status.

## Features

### 🏗️ Site Selection
- Visual site cards with key metrics
- Risk level indicators (High, Moderate, Low)
- Real-time worker count and camera status
- Compliance percentage display
- Quick alert summary for each site

### 📱 Mobile-Optimized Dashboard
- Touch-friendly interface designed for phones
- Real-time alert monitoring
- Alert categorization (Critical, Warning, Info)
- Time-based alert sorting
- Professional safety-focused design

### 🚨 Alert Management
- Critical safety alerts (No helmet, Falls, Unauthorized entry)
- Warning alerts (Proximity violations, Missing PPE)
- Informational alerts (System checks, Equipment status)
- Confidence scores for AI detections
- Timestamp and location information

## Screenshots Preview

### Site Login Screen
- Clean, card-based site selection
- Color-coded risk levels
- At-a-glance site statistics
- Alert count summaries

### Dashboard
- Site overview with key metrics
- Alert priority visualization
- Detailed alert descriptions
- Time-based organization
- Easy navigation back to site selection

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Install Node.js** (if not already installed):
   ```bash
   # Using Homebrew on macOS
   brew install node
   
   # Or download from https://nodejs.org/
   ```

2. **Navigate to the project directory**:
   ```bash
   cd "/Users/aayushpatel/Desktop/RU Hack/supervisor-app/supervisor-app"
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Open in browser**:
   - The app will open at `http://localhost:3000`
   - For mobile testing, use your phone's browser with your computer's IP address

## Mobile Testing

### On Physical Device
1. Find your computer's IP address:
   ```bash
   ipconfig getifaddr en0  # macOS
   ```
2. Open `http://[YOUR_IP]:3000` on your phone's browser
3. Add to home screen for app-like experience

### Browser DevTools
1. Open Chrome DevTools (F12)
2. Click the device toggle icon (📱)
3. Select a mobile device preset
4. Test touch interactions and responsive design

## Project Structure

```
src/
├── App.js                 # Main application component
├── App.css               # Global styles and utilities
├── components/
│   ├── SiteLogin.js      # Site selection interface
│   ├── SiteLogin.css     # Site login styles
│   ├── Dashboard.js      # Main dashboard component
│   └── Dashboard.css     # Dashboard styles
└── index.js              # Application entry point
```

## Key Components

### SiteLogin Component
- Displays available construction sites
- Shows risk levels and basic metrics
- Handles site selection and authentication
- Mobile-optimized card layout

### Dashboard Component
- Real-time site monitoring interface
- Alert management and display
- Site statistics overview
- Responsive mobile design

## Styling Approach

### Mobile-First Design
- Responsive grid layouts
- Touch-friendly button sizes (minimum 44px)
- Optimized for one-handed use
- Clear visual hierarchy

### Color Coding
- **Critical Alerts**: Red (#dc3545)
- **Warning Alerts**: Orange (#fd7e14)
- **Info Alerts**: Blue (#17a2b8)
- **Success/Safe**: Green (#28a745)

### Typography
- System fonts for optimal mobile performance
- Scalable text sizes using clamp()
- High contrast for outdoor visibility

## Data Integration

Currently using mock data that matches the structure from `flask-video-server/data/alerts.json`.

### To Connect to Real API:
1. Update the `loadAlertsData` function in `App.js`
2. Replace mock data with fetch call to your Flask server
3. Handle loading states and error conditions
4. Add authentication if required

Example API integration:
```javascript
const response = await fetch('http://your-flask-server:5000/api/alerts');
const alertsData = await response.json();
setAlertsData(alertsData);
```

## Production Deployment

### Build for Production
```bash
npm run build
```

### Serve Static Files
```bash
# Using serve (install first: npm install -g serve)
serve -s build -l 3000

# Or use any static file server
python -m http.server 3000 --directory build
```

### Mobile App Deployment
- Deploy to a web server with HTTPS
- Configure PWA settings for mobile app-like experience
- Test on actual devices for performance optimization

## Customization

### Adding New Alert Types
1. Update the `getAlertIcon` function in `Dashboard.js`
2. Add appropriate emoji or icon for the new alert type
3. Ensure color coding matches severity level

### Modifying Site Data
1. Update the mock data structure in `App.js`
2. Or connect to your real API endpoint
3. Ensure data structure matches expected format

### Styling Customization
1. Modify CSS custom properties for theme colors
2. Update responsive breakpoints as needed
3. Adjust spacing and typography scales

## Browser Support

- iOS Safari 12+
- Android Chrome 70+
- Modern mobile browsers
- PWA-compatible browsers

## Performance Considerations

- Lightweight components for fast loading
- Efficient re-rendering with React hooks
- Optimized images and assets
- Minimal external dependencies

## Security Notes

- Implement proper authentication before production
- Use HTTPS for all API communications
- Validate all data from external sources
- Consider rate limiting for API endpoints

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
