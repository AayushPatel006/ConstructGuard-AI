#!/usr/bin/env python3
"""
ConstructGuard-AI Automatic Video Processing Service
Start this script to automatically process videos as they arrive
"""

import sys
import os
from pathlib import Path

# Add the flask-video-server to path for imports
flask_server_path = Path(__file__).parent / "flask-video-server"
if flask_server_path.exists():
    sys.path.insert(0, str(flask_server_path))

try:
    from video_watcher import VideoWatcher
    from ppe_detector import initialize_ppe_detector
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure video_watcher.py is in the same directory")
    sys.exit(1)

def install_watchdog():
    """Install watchdog if not available"""
    try:
        import watchdog
        return True
    except ImportError:
        print("📦 Installing watchdog for file monitoring...")
        import subprocess
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "watchdog"])
            print("✅ Watchdog installed successfully")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install watchdog. Please install manually:")
            print("   pip install watchdog")
            return False

def main():
    """Main function to start the video processing service"""
    print("🦺 ConstructGuard-AI Automatic Video Processor")
    print("=" * 50)
    
    # Check and install dependencies
    if not install_watchdog():
        return
    
    # Initialize PPE detector
    print("🔧 Initializing PPE detection system...")
    detector = initialize_ppe_detector()
    
    if detector.model is None:
        print("⚠️  YOLO model not loaded - will use simulated detection")
        print("   To enable real detection, install: pip install ultralytics")
    else:
        print("✅ YOLO model loaded and ready")
    
    # Create video directory if it doesn't exist
    video_dir = Path("construction_videos")
    video_dir.mkdir(exist_ok=True)
    
    print(f"\n📁 Video Directory: {video_dir.absolute()}")
    print("🎬 Supported formats: .mp4, .avi, .mov, .mkv")
    print("\n💡 Instructions:")
    print("   1. Drop construction site videos into the 'construction_videos' folder")
    print("   2. Videos will be automatically analyzed for PPE compliance")
    print("   3. Results will be saved in the 'ppe_results' folder")
    print("   4. Summary files will be created in 'construction_videos/summaries'")
    print("\n🚀 Starting automatic video processing...")
    print("   Press Ctrl+C to stop\n")
    
    # Start the video watcher
    try:
        watcher = VideoWatcher("construction_videos")
        watcher.start_watching()
    except KeyboardInterrupt:
        print("\n👋 Video processing service stopped")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()