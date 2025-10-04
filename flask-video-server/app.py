from flask import Flask, Response, render_template_string
from flask_cors import CORS
import cv2
import threading
import time
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React app

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

if __name__ == '__main__':
    print("Starting ConstructGuard-AI Video Server...")
    print("Video feed available at: http://localhost:2000/video_feed")
    app.run(host='0.0.0.0', port=2000, debug=True, threaded=True)