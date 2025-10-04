# ConstructGuard-AI Video Server

## 📹 Video File Setup

### How to Add Construction Site Videos

1. **Place video files** in the `videos/` directory
2. **Name them according to site IDs:**
   - `site1_construction.mp4` - Downtown Plaza (High Risk)
   - `site2_construction.mp4` - Riverside Complex (Moderate Risk)
   - `site3_construction.mp4` - Tech Hub Center (Low Risk)
   - `site4_construction.mp4` - Harbor Bridge (Moderate Risk)

### Supported Video Formats
- `.mp4` (recommended)
- `.avi`
- `.mov`
- `.mkv`

### Features
- **Auto-loop**: Videos automatically restart when they reach the end
- **Frame rate preservation**: Videos play at their original frame rate
- **Site-specific feeds**: Each construction site can have its own video
- **Fallback to webcam**: If no video file exists, uses webcam feed
- **Real-time overlay**: Displays timestamp and status information

### API Endpoints
- `GET /video_feed` - Default video feed
- `GET /video_feed/<site_id>` - Site-specific video feed
- `GET /videos` - List available video files
- `GET /upload_info` - Get upload instructions
- `GET /health` - Server health check

### Example Video URLs
- Site 1: `http://localhost:2000/video_feed/1`
- Site 2: `http://localhost:2000/video_feed/2`
- Site 3: `http://localhost:2000/video_feed/3`
- Site 4: `http://localhost:2000/video_feed/4`

### Video Recommendations
- **Resolution**: 640x480 or higher
- **Frame rate**: 24-30 FPS
- **Duration**: 30 seconds to 5 minutes (will loop)
- **Content**: Construction site footage, safety demonstrations, etc.

### Testing with Sample Videos
If you don't have construction videos, you can:
1. Download sample videos from the internet
2. Use your phone to record short construction-like videos
3. The system will fall back to webcam if no video files are found

### Starting the Server
```bash
cd flask-video-server
python app.py
```

The server will run on `http://localhost:2000`