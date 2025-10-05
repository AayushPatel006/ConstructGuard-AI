"""
Video File Watcher for ConstructGuard-AI
Automatically processes new video files when they appear in the watch directory
"""

import os
import time
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import threading
import re
from ppe_detector import initialize_ppe_detector

class VideoFileHandler(FileSystemEventHandler):
    """Handler for new video file events"""
    
    def __init__(self, watch_directory="construction_videos"):
        self.watch_directory = Path(watch_directory)
        self.watch_directory.mkdir(exist_ok=True)
        self.video_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv'}
        self.processing_files = set()  # Track files currently being processed
        self.processed_files = set()   # Track files already processed
        
        # Load list of already processed files
        self.load_processed_files()
        
        print(f"📁 Watching directory: {self.watch_directory.absolute()}")
        print(f"🎬 Supported formats: {', '.join(self.video_extensions)}")
    
    def load_processed_files(self):
        """Load list of previously processed files"""
        processed_log = self.watch_directory / "processed_files.log"
        if processed_log.exists():
            with open(processed_log, 'r') as f:
                self.processed_files = set(line.strip() for line in f if line.strip())
        print(f"📋 Found {len(self.processed_files)} previously processed files")
    
    def save_processed_file(self, filename):
        """Save filename to processed list"""
        processed_log = self.watch_directory / "processed_files.log"
        with open(processed_log, 'a') as f:
            f.write(f"{filename}\n")
        self.processed_files.add(filename)
    
    def extract_site_id_from_filename(self, filename):
        """Extract site ID from filename using various patterns"""
        filename_lower = filename.lower()
        
        # Pattern 1: site_001, site001, SITE_001, etc.
        site_match = re.search(r'site[_-]?(\d+)', filename_lower)
        if site_match:
            return f"SITE_{site_match.group(1).zfill(3)}"
        
        # Pattern 2: Look for SITE_XXX anywhere in filename
        site_match = re.search(r'(site[_-]?\d+)', filename_lower)
        if site_match:
            return site_match.group(1).upper().replace('-', '_')
        
        # Pattern 3: Use sequential numbering based on processed count
        site_number = (len(self.processed_files) % 4) + 1
        return f"SITE_{str(site_number).zfill(3)}"
    
    def is_video_file(self, filepath):
        """Check if file is a supported video format"""
        return Path(filepath).suffix.lower() in self.video_extensions
    
    def is_file_complete(self, filepath, wait_time=2):
        """Check if file upload is complete by monitoring file size"""
        if not os.path.exists(filepath):
            return False
        
        initial_size = os.path.getsize(filepath)
        time.sleep(wait_time)
        
        try:
            final_size = os.path.getsize(filepath)
            return initial_size == final_size and final_size > 0
        except OSError:
            return False
    
    def on_created(self, event):
        """Handle new file creation"""
        if event.is_directory:
            return
        
        filepath = event.src_path
        filename = os.path.basename(filepath)
        
        # Check if it's a video file
        if not self.is_video_file(filepath):
            return
        
        # Skip if already processed or currently processing
        if filename in self.processed_files or filename in self.processing_files:
            return
        
        print(f"🎬 New video detected: {filename}")
        
        # Process in background thread to avoid blocking the watcher
        thread = threading.Thread(
            target=self.process_video_async, 
            args=(filepath, filename),
            daemon=True
        )
        thread.start()
    
    def on_moved(self, event):
        """Handle file moves (like downloads completing)"""
        if event.is_directory:
            return
        
        # Treat moved files as new files
        self.on_created(event)
    
    def process_video_async(self, filepath, filename):
        """Process video file asynchronously"""
        try:
            # Mark as processing
            self.processing_files.add(filename)
            
            # Wait for file to be completely uploaded
            print(f"⏳ Waiting for {filename} to complete upload...")
            if not self.is_file_complete(filepath, wait_time=3):
                print(f"❌ File {filename} appears to be incomplete or corrupted")
                return
            
            # Extract site ID from filename
            site_id = self.extract_site_id_from_filename(filename)
            
            print(f"🔍 Processing {filename} for {site_id}...")
            
            # Initialize detector and process
            detector = initialize_ppe_detector()
            results = detector.analyze_video(filepath, site_id)
            
            # Log results
            compliance = results.get('compliance_score', 0)
            violations = results.get('total_violations', 0)
            
            print(f"✅ Analysis complete for {filename}:")
            print(f"   🎯 Site: {site_id}")
            print(f"   📊 Compliance: {compliance}%")
            print(f"   ⚠️  Violations: {violations}")
            
            if violations > 0:
                print(f"   🚨 Alert: {violations} safety violations detected!")
            
            # Mark as processed
            self.save_processed_file(filename)
            
            # Create a summary file for this video
            self.create_video_summary(filename, site_id, results)
            
        except Exception as e:
            print(f"❌ Error processing {filename}: {e}")
        finally:
            # Remove from processing set
            self.processing_files.discard(filename)
    
    def create_video_summary(self, filename, site_id, results):
        """Create a summary file for the processed video"""
        summary_dir = self.watch_directory / "summaries"
        summary_dir.mkdir(exist_ok=True)
        
        summary_file = summary_dir / f"{Path(filename).stem}_summary.txt"
        
        with open(summary_file, 'w') as f:
            f.write(f"PPE Analysis Summary\n")
            f.write(f"=" * 50 + "\n")
            f.write(f"Video File: {filename}\n")
            f.write(f"Site ID: {site_id}\n")
            f.write(f"Analysis Time: {results.get('analysis_timestamp', 'Unknown')}\n")
            f.write(f"Compliance Score: {results.get('compliance_score', 0)}%\n")
            f.write(f"Total Violations: {results.get('total_violations', 0)}\n")
            f.write(f"Frames Processed: {results.get('total_frames_processed', 0)}\n")
            f.write(f"\nViolation Breakdown:\n")
            f.write(f"- Helmet Violations: {results.get('summary', {}).get('helmet_violations', 0)}\n")
            f.write(f"- Vest Violations: {results.get('summary', {}).get('vest_violations', 0)}\n")
            f.write(f"\nRecent Alerts:\n")
            
            for alert in results.get('alerts', [])[:5]:  # Show last 5 alerts
                f.write(f"- {alert.get('type', 'Unknown')}: {alert.get('description', '')}\n")

class VideoWatcher:
    """Main video watcher class"""
    
    def __init__(self, watch_directory="construction_videos"):
        self.watch_directory = watch_directory
        self.event_handler = VideoFileHandler(watch_directory)
        self.observer = Observer()
        
    def start_watching(self):
        """Start the file watcher"""
        print(f"🚀 Starting ConstructGuard-AI Video Watcher...")
        print(f"📂 Monitoring: {Path(self.watch_directory).absolute()}")
        print(f"💡 Drop video files into this directory for automatic PPE analysis")
        print(f"🔄 Press Ctrl+C to stop watching\n")
        
        # Process any existing files first
        self.process_existing_files()
        
        # Start watching for new files
        self.observer.schedule(
            self.event_handler, 
            self.watch_directory, 
            recursive=False
        )
        self.observer.start()
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Stopping video watcher...")
            self.observer.stop()
        
        self.observer.join()
        print("✅ Video watcher stopped")
    
    def process_existing_files(self):
        """Process any existing video files in the directory"""
        watch_path = Path(self.watch_directory)
        video_files = []
        
        for ext in self.event_handler.video_extensions:
            video_files.extend(watch_path.glob(f"*{ext}"))
        
        unprocessed_files = [
            f for f in video_files 
            if f.name not in self.event_handler.processed_files
        ]
        
        if unprocessed_files:
            print(f"📁 Found {len(unprocessed_files)} existing video files to process...")
            for video_file in unprocessed_files:
                if video_file.name not in self.event_handler.processing_files:
                    print(f"🎬 Processing existing file: {video_file.name}")
                    thread = threading.Thread(
                        target=self.event_handler.process_video_async,
                        args=(str(video_file), video_file.name),
                        daemon=True
                    )
                    thread.start()
        else:
            print("📂 No unprocessed video files found in directory")

if __name__ == "__main__":
    # Create watcher instance
    watcher = VideoWatcher("construction_videos")
    
    # Start watching
    watcher.start_watching()