# Construction Video Processing Guide

## 📁 Video Directory Structure

Place your construction site videos in these directories:

```
/Users/aayushpatel/Desktop/RU Hack/
├── construction_videos/          # Main video directory
│   ├── site_001_morning.mp4     # Site 1 videos
│   ├── site_001_afternoon.mp4
│   ├── site_002_inspection.mp4  # Site 2 videos
│   └── site_003_worker_zone.mp4 # Site 3 videos
├── flask-video-server/
│   ├── ppe_detector.py          # PPE detection module
│   ├── app.py                   # Flask server
│   └── ppe_results/             # Analysis results
└── process_video_example.py     # Processing examples

```

## 🎬 Supported Video Formats

- `.mp4` (recommended)
- `.avi`
- `.mov`
- `.mkv`

## 🚀 Processing Methods

### Method 1: Via Web Interface
1. Start Flask server: `python app.py`
2. Start React app: `npm run dev`
3. Click on construction sites in the map
4. Click "🦺 PPE Analysis" button

### Method 2: API Calls
```bash
# Check system status
curl http://localhost:2000/api/ppe/status

# Start analysis for a site
curl -X POST http://localhost:2000/api/ppe/analyze/SITE_001

# Get results
curl http://localhost:2000/api/ppe/results/SITE_001
```

### Method 3: Direct Python Script
```python
from ppe_detector import PPEDetector

detector = PPEDetector()
results = detector.analyze_video("your_video.mp4", "SITE_001")
print(f"Compliance: {results['compliance_score']}%")
```

## 📊 Output Files

Analysis generates:
- `ppe_results/ppe_analysis_SITE_001_20231005_143022.csv` - Frame-by-frame data
- `ppe_results/ppe_alerts_SITE_001_20231005_143022.json` - Violation alerts
- Console output with real-time progress

## 🎯 What Gets Detected

- **Helmets/Hard Hats**: Safety helmets and hard hats
- **Safety Vests**: High-visibility and reflective vests  
- **Face Masks**: Protective face coverings

## ⚙️ Configuration Options

In `ppe_detector.py`, you can adjust:
- `conf_threshold=0.25` - Detection confidence threshold
- `weights_path="yolo11n.pt"` - YOLO model path
- Frame processing interval (currently every 30th frame)

## 🔧 Troubleshooting

**No YOLO model?** 
- System automatically falls back to simulated demo data
- Install with: `pip install ultralytics`

**No video processing?**
- Install: `pip install imageio[ffmpeg]`
- Or use simulated data for testing

**Performance slow?**
- Reduce frame processing frequency
- Use smaller YOLO model (yolo11n.pt vs yolo11x.pt)
- Process shorter video clips