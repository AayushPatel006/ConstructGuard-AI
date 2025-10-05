from flask import Flask, Response, render_template_string, jsonify, request
from flask_cors import CORS
import cv2
import threading
import time
import os
import json
from ppe_detector import initialize_ppe_detector, analyze_video_async

# Import video watcher for automatic processing
try:
    from video_watcher import VideoWatcher
    VIDEO_WATCHER_AVAILABLE = True
except ImportError:
    VIDEO_WATCHER_AVAILABLE = False
    print("Video watcher not available - manual processing only")

app = Flask(__name__)
CORS(app)  # Enable CORS for React app

# Initialize PPE detector
ppe_detector = initialize_ppe_detector()

# Global video watcher instance
video_watcher = None

# Start automatic video processing
def start_video_watcher():
    """Start the automatic video processing service"""
    global video_watcher
    if VIDEO_WATCHER_AVAILABLE and video_watcher is None:
        try:
            video_watcher = VideoWatcher("../construction_videos")
            # Start in background thread
            watcher_thread = threading.Thread(
                target=video_watcher.start_watching,
                daemon=True
            )
            watcher_thread.start()
            print("🚀 Automatic video processing started")
        except Exception as e:
            print(f"Failed to start video watcher: {e}")

# Start video watcher when app starts
start_video_watcher()

# Load alerts data
def load_alerts_data():
    try:
        with open('data/alerts.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Warning: alerts.json not found")
        return {"sites": []}
    except json.JSONDecodeError:
        print("Warning: Invalid JSON in alerts.json")
        return {"sites": []}

class VideoCamera:
    def __init__(self, video_source=None):
        # Use video file if provided, otherwise use default camera
        if video_source and os.path.exists(video_source):
            self.video = cv2.VideoCapture(video_source)
            self.is_file = True
            print(f"Loading video file: {video_source}")
        else:
            self.video = cv2.VideoCapture(0)
            self.is_file = False
            print("Using webcam feed")
            
        self.video.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.video.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        # For video files, get total frame count and FPS
        if self.is_file:
            self.total_frames = int(self.video.get(cv2.CAP_PROP_FRAME_COUNT))
            self.fps = self.video.get(cv2.CAP_PROP_FPS)
            self.current_frame = 0
            print(f"Video info: {self.total_frames} frames, {self.fps} FPS")
        
    def __del__(self):
        self.video.release()
        
    def get_frame(self):
        success, image = self.video.read()
        
        # If it's a video file and we've reached the end, restart from beginning
        if not success and self.is_file:
            self.video.set(cv2.CAP_PROP_POS_FRAMES, 0)
            self.current_frame = 0
            success, image = self.video.read()
            
        if not success:
            return None
        
        # Update frame counter for video files
        if self.is_file:
            self.current_frame += 1
        
        # Add some text overlay for construction site simulation
        font = cv2.FONT_HERSHEY_SIMPLEX
        cv2.putText(image, 'ConstructGuard-AI Live Feed', (10, 30), font, 0.7, (0, 255, 0), 2)
        cv2.putText(image, f'Time: {time.strftime("%H:%M:%S")}', (10, 60), font, 0.5, (255, 255, 255), 1)
        
        if self.is_file:
            cv2.putText(image, f'Frame: {self.current_frame}/{self.total_frames}', (10, 90), font, 0.5, (255, 255, 0), 1)
            cv2.putText(image, 'Status: VIDEO PLAYBACK', (10, 120), font, 0.5, (0, 255, 255), 1)
        else:
            cv2.putText(image, 'Status: LIVE MONITORING', (10, 90), font, 0.5, (0, 255, 0), 1)
        
        # Convert image to JPEG
        ret, jpeg = cv2.imencode('.jpg', image)
        return jpeg.tobytes()

def generate_frames(camera):
    while True:
        frame = camera.get_frame()
        if frame is not None:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        # Adjust frame rate - for video files, use original FPS
        if hasattr(camera, 'is_file') and camera.is_file and hasattr(camera, 'fps'):
            time.sleep(1.0 / camera.fps)  # Use original video FPS
        else:
            time.sleep(0.1)  # 10 FPS for webcam

# Video file paths for different sites
VIDEO_FILES = {
    1: "videos/site1_construction.mp4",
    2: "videos/site2_construction.mp4", 
    3: "videos/site3_construction.mp4",
    4: "videos/site4_construction.mp4"
}

@app.route('/video_feed')
def video_feed():
    # Default video feed (webcam or first video file)
    video_path = VIDEO_FILES.get(1, None)
    camera = VideoCamera(video_path)
    return Response(generate_frames(camera),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_feed/<int:site_id>')
def video_feed_site(site_id):
    """Serve different video files for different construction sites"""
    video_path = VIDEO_FILES.get(site_id, None)
    camera = VideoCamera(video_path)
    return Response(generate_frames(camera),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/health')
def health():
    return {'status': 'ok', 'message': 'Video server is running'}

@app.route('/videos')
def list_videos():
    """List available video files"""
    videos_dir = 'videos'
    if not os.path.exists(videos_dir):
        return {'videos': [], 'message': 'Videos directory not found'}
    
    video_files = []
    for filename in os.listdir(videos_dir):
        if filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):
            video_files.append(filename)
    
    return {'videos': video_files, 'videos_dir': os.path.abspath(videos_dir)}

@app.route('/upload_info')
def upload_info():
    """Provide information about uploading videos"""
    videos_dir = os.path.abspath('videos')
    return {
        'message': 'Place your construction site videos in the videos folder',
        'videos_directory': videos_dir,
        'supported_formats': ['.mp4', '.avi', '.mov', '.mkv'],
        'naming_convention': {
            'site1': 'site1_construction.mp4',
            'site2': 'site2_construction.mp4', 
            'site3': 'site3_construction.mp4',
            'site4': 'site4_construction.mp4'
        }
    }

# API Endpoints for Alerts Data
@app.route('/api/alerts')
def get_all_alerts():
    """Get all alerts from all sites"""
    data = load_alerts_data()
    return jsonify(data)

@app.route('/api/alerts/<site_id>')
def get_site_alerts(site_id):
    """Get alerts for a specific site"""
    data = load_alerts_data()
    
    # Find site by ID (support both SITE_001 format and numeric IDs)
    site = None
    for s in data['sites']:
        if s['id'] == site_id or s['id'] == f"SITE_{site_id.zfill(3)}":
            site = s
            break
    
    if not site:
        return jsonify({'error': 'Site not found'}), 404
    
    return jsonify(site)

@app.route('/api/alerts/<site_id>/<alert_type>')
def get_site_alerts_by_type(site_id, alert_type):
    """Get specific type of alerts for a site (critical, warning, info)"""
    data = load_alerts_data()
    
    # Find site by ID
    site = None
    for s in data['sites']:
        if s['id'] == site_id or s['id'] == f"SITE_{site_id.zfill(3)}":
            site = s
            break
    
    if not site:
        return jsonify({'error': 'Site not found'}), 404
    
    if alert_type not in ['critical', 'warning', 'info']:
        return jsonify({'error': 'Invalid alert type. Use: critical, warning, info'}), 400
    
    return jsonify({
        'site_id': site['id'],
        'site_name': site['name'],
        'alert_type': alert_type,
        'alerts': site['alerts'].get(alert_type, [])
    })

@app.route('/api/sites')
def get_all_sites():
    """Get basic site information without alerts"""
    data = load_alerts_data()
    sites = []
    
    for site in data['sites']:
        # Count alerts
        critical_count = len(site['alerts'].get('critical', []))
        warning_count = len(site['alerts'].get('warning', []))
        info_count = len(site['alerts'].get('info', []))
        
        sites.append({
            'id': site['id'],
            'name': site['name'],
            'location': site['location'],
            'riskLevel': site['riskLevel'],
            'riskScore': site['riskScore'],
            'compliance': site['compliance'],
            'workers': site['workers'],
            'aiCameras': site['aiCameras'],
            'lastCheck': site['lastCheck'],
            'alertCounts': {
                'critical': critical_count,
                'warning': warning_count,
                'info': info_count,
                'total': critical_count + warning_count + info_count
            }
        })
    
    return jsonify({'sites': sites})

@app.route('/api/dashboard/summary')
def get_dashboard_summary():
    """Get dashboard summary statistics"""
    data = load_alerts_data()
    
    total_sites = len(data['sites'])
    total_workers = sum(site['workers'] for site in data['sites'])
    total_cameras = sum(site['aiCameras'] for site in data['sites'])
    
    # Count alerts by type
    total_critical = 0
    total_warning = 0
    total_info = 0
    
    risk_levels = {'High': 0, 'Moderate': 0, 'Low': 0}
    
    for site in data['sites']:
        total_critical += len(site['alerts'].get('critical', []))
        total_warning += len(site['alerts'].get('warning', []))
        total_info += len(site['alerts'].get('info', []))
        
        risk_level = site.get('riskLevel', 'Unknown')
        if risk_level in risk_levels:
            risk_levels[risk_level] += 1
    
    # Calculate average compliance and risk score
    avg_compliance = sum(site['compliance'] for site in data['sites']) / total_sites if total_sites > 0 else 0
    avg_risk_score = sum(site['riskScore'] for site in data['sites']) / total_sites if total_sites > 0 else 0
    
    return jsonify({
        'summary': {
            'totalSites': total_sites,
            'totalWorkers': total_workers,
            'totalCameras': total_cameras,
            'averageCompliance': round(avg_compliance, 1),
            'averageRiskScore': round(avg_risk_score, 1)
        },
        'alerts': {
            'critical': total_critical,
            'warning': total_warning,
            'info': total_info,
            'total': total_critical + total_warning + total_info
        },
        'riskDistribution': risk_levels
    })

# PPE Detection Endpoints
@app.route('/api/ppe/analyze/<site_id>', methods=['POST'])
def analyze_site_ppe(site_id):
    """Analyze PPE compliance for a specific site"""
    try:
        # Check if video file exists for the site
        video_files = {
            '1': 'videos/site1_construction.mp4',
            'SITE_001': 'videos/site1_construction.mp4',
            '2': 'videos/site2_construction.mp4', 
            'SITE_002': 'videos/site2_construction.mp4',
            '3': 'videos/site3_construction.mp4',
            'SITE_003': 'videos/site3_construction.mp4',
            '4': 'videos/site4_construction.mp4',
            'SITE_004': 'videos/site4_construction.mp4'
        }
        
        video_path = video_files.get(site_id)
        if not video_path or not os.path.exists(video_path):
            # Use simulated analysis if no video file
            results = ppe_detector.create_simulated_results(site_id)
        else:
            # Analyze actual video file
            results = ppe_detector.analyze_video(video_path, site_id)
        
        return jsonify(results)
    
    except Exception as e:
        return jsonify({
            'error': 'PPE analysis failed',
            'message': str(e),
            'site_id': site_id
        }), 500

@app.route('/api/ppe/results/<site_id>')
def get_ppe_results(site_id):
    """Get latest PPE analysis results for a site"""
    try:
        results = ppe_detector.get_latest_results(site_id)
        return jsonify(results)
    except Exception as e:
        return jsonify({
            'error': 'Failed to get PPE results',
            'message': str(e)
        }), 500

@app.route('/api/ppe/status')
def ppe_status():
    """Get PPE detection system status"""
    try:
        # Import checks
        status = {
            'ppe_detection_available': True,
            'yolo_available': False,
            'imageio_available': False
        }
        
        try:
            from ultralytics import YOLO
            status['yolo_available'] = True
        except ImportError:
            pass
        
        try:
            import imageio.v2 as imageio
            status['imageio_available'] = True
        except ImportError:
            pass
        
        status['model_loaded'] = ppe_detector.model is not None if ppe_detector else False
        status['results_directory'] = str(ppe_detector.results_dir) if ppe_detector else 'Not initialized'
        
        return jsonify(status)
    
    except Exception as e:
        return jsonify({
            'error': 'Failed to get PPE status',
            'message': str(e)
        }), 500

@app.route('/api/ppe/batch-analyze', methods=['POST'])
def batch_analyze_ppe():
    """Analyze PPE for all sites with available videos"""
    try:
        video_files = {
            'SITE_001': 'videos/site1_construction.mp4',
            'SITE_002': 'videos/site2_construction.mp4',
            'SITE_003': 'videos/site3_construction.mp4',
            'SITE_004': 'videos/site4_construction.mp4'
        }
        
        results = {}
        for site_id, video_path in video_files.items():
            if os.path.exists(video_path):
                # Start async analysis
                thread = analyze_video_async(video_path, site_id)
                results[site_id] = {
                    'status': 'analysis_started',
                    'video_path': video_path
                }
            else:
                # Use simulated results
                results[site_id] = ppe_detector.create_simulated_results(site_id)
                results[site_id]['status'] = 'simulated'
        
        return jsonify({
            'message': 'Batch PPE analysis initiated',
            'results': results
        })
    
    except Exception as e:
        return jsonify({
            'error': 'Batch analysis failed',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting ConstructGuard-AI Video Server...")
    print("Video feed available at: http://localhost:5001/video_feed")
    app.run(host='0.0.0.0', port=2000, debug=True, threaded=True)