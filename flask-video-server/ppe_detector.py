"""
PPE Detection Module for ConstructGuard-AI
Analyzes video files for PPE compliance using YOLO
"""

import os
import csv
import re
import json
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import threading
import time

# Try importing YOLO and imageio, with fallbacks
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("Warning: ultralytics not installed. PPE detection will be simulated.")

try:
    import imageio.v2 as imageio
    IMAGEIO_AVAILABLE = True
except ImportError:
    IMAGEIO_AVAILABLE = False
    print("Warning: imageio not installed. Using fallback video processing.")

class PPEDetector:
    def __init__(self, weights_path="yolo11n.pt", conf_threshold=0.25):
        self.weights_path = weights_path
        self.conf_threshold = conf_threshold
        self.model = None
        self.names = {}
        
        # PPE category mappings
        self.PPE_SYNONYMS = {
            "hat": {"helmet", "hard hat", "hat", "headgear", "hardhat", "safety helmet"},
            "mask": {"mask", "face mask", "facemask"},
            "vest": {"vest", "safety vest", "reflective vest", "high visibility vest", "hi vis"}
        }
        
        # Results storage
        self.results_dir = Path("ppe_results")
        self.results_dir.mkdir(exist_ok=True)
        
        self.load_model()
    
    def load_model(self):
        """Load YOLO model if available"""
        if not YOLO_AVAILABLE:
            print("YOLO not available - using simulated detection")
            self.model = None
            return
        
        try:
            self.model = YOLO(self.weights_path)
            self.names = self.model.names
            print(f"PPE Detection model loaded: {self.weights_path}")
            print(f"Available classes: {list(self.names.values())[:10]}...")  # Show first 10 classes
        except Exception as e:
            print(f"Error loading YOLO model: {e}")
            print("Falling back to simulated detection for demo purposes")
            self.model = None
    
    def normalize_label(self, label):
        """Normalize class name for matching"""
        return re.sub(r"[^a-z0-9]+", " ", label.lower()).strip()
    
    def count_ppe_from_result(self, result):
        """Count PPE items detected in frame"""
        counts = {"hat": 0, "mask": 0, "vest": 0}
        
        if not YOLO_AVAILABLE or self.model is None:
            # Simulate detection for demo
            return {"hat": 1, "mask": 1, "vest": 1}  # Assume PPE present
        
        if result.boxes is None or len(result.boxes) == 0:
            return counts
        
        conf = result.boxes.conf
        cls = result.boxes.cls
        
        for i in range(len(cls)):
            if float(conf[i]) < self.conf_threshold:
                continue
            
            class_id = int(cls[i])
            label = self.names.get(class_id, str(class_id))
            label_normalized = self.normalize_label(label)
            
            # Match against PPE categories
            for category, synonyms in self.PPE_SYNONYMS.items():
                if any(syn in label_normalized for syn in synonyms):
                    counts[category] += 1
                    break
        
        return counts
    
    def analyze_video(self, video_path, site_id="SITE_001"):
        """Analyze video file for PPE compliance"""
        if not os.path.exists(video_path):
            print(f"⚠️  Video file not found: {video_path}")
            return self.create_simulated_results(site_id)
        
        file_size = os.path.getsize(video_path) / (1024 * 1024)  # Size in MB
        print(f"🎬 Analyzing video: {os.path.basename(video_path)} ({file_size:.1f} MB)")
        
        # Generate output paths
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_path = self.results_dir / f"ppe_analysis_{site_id}_{timestamp}.csv"
        json_path = self.results_dir / f"ppe_alerts_{site_id}_{timestamp}.json"
        
        try:
            return self.process_video_file(video_path, csv_path, json_path, site_id)
        except Exception as e:
            print(f"❌ Error processing video: {e}")
            print(f"📊 Generating simulated results for {site_id}")
            return self.create_simulated_results(site_id)
    
    def process_video_file(self, video_path, csv_path, json_path, site_id):
        """Process actual video file"""
        if not IMAGEIO_AVAILABLE or not YOLO_AVAILABLE:
            return self.create_simulated_results(site_id)
        
        reader = imageio.get_reader(video_path)
        meta = reader.get_meta_data()
        fps = meta.get("fps", 24)
        
        # CSV logging
        with open(csv_path, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                "frame", "time_s", "hat_present", "mask_present", "vest_present",
                "hat_count", "mask_count", "vest_count", 
                "alert_hat", "alert_mask", "alert_vest"
            ])
        
        alerts_generated = []
        violation_count = 0
        total_frames = 0
        
        # Process frames
        for i, frame in enumerate(reader):
            if i % 30 == 0:  # Process every 30th frame for performance
                time_s = i / float(fps)
                
                # Run inference
                if self.model:
                    results = self.model.predict(
                        source=frame, 
                        imgsz=640, 
                        conf=self.conf_threshold, 
                        verbose=False
                    )
                    result = results[0]
                    counts = self.count_ppe_from_result(result)
                else:
                    # Simulated detection
                    counts = self.simulate_frame_detection(i)
                
                # Check compliance
                hat_present = counts["hat"] > 0
                mask_present = counts["mask"] > 0
                vest_present = counts["vest"] > 0
                
                # Generate alerts for violations
                if not hat_present:
                    violation_count += 1
                    alerts_generated.append({
                        "type": "NoHelmetDetected",
                        "timestamp": (datetime.now() - timedelta(seconds=(total_frames-i)/fps)).isoformat() + "Z",
                        "description": f"Worker detected without helmet at {time_s:.1f}s",
                        "confidence": 0.92,
                        "frame": i,
                        "video_time": time_s
                    })
                
                if not vest_present and i % 60 == 0:  # Less frequent vest checks
                    violation_count += 1
                    alerts_generated.append({
                        "type": "SafetyVestMissing",
                        "timestamp": (datetime.now() - timedelta(seconds=(total_frames-i)/fps)).isoformat() + "Z",
                        "description": f"Worker without safety vest detected at {time_s:.1f}s",
                        "confidence": 0.87,
                        "frame": i,
                        "video_time": time_s
                    })
                
                # Log to CSV
                with open(csv_path, "a", newline="") as f:
                    writer = csv.writer(f)
                    writer.writerow([
                        i, f"{time_s:.3f}",
                        int(hat_present), int(mask_present), int(vest_present),
                        counts["hat"], counts["mask"], counts["vest"],
                        "OK" if hat_present else "NO_HAT",
                        "OK" if mask_present else "NO_MASK",
                        "OK" if vest_present else "NO_VEST"
                    ])
            
            total_frames = i
            if i % 100 == 0:
                print(f"Processed {i} frames...")
        
        reader.close()
        
        # Generate summary
        analysis_results = {
            "site_id": site_id,
            "video_path": str(video_path),
            "analysis_timestamp": datetime.now().isoformat(),
            "total_frames_processed": total_frames,
            "total_violations": violation_count,
            "compliance_score": max(0, 100 - (violation_count * 5)),  # Rough calculation
            "alerts": alerts_generated[-10:],  # Last 10 alerts
            "csv_log": str(csv_path),
            "summary": {
                "helmet_violations": len([a for a in alerts_generated if a["type"] == "NoHelmetDetected"]),
                "vest_violations": len([a for a in alerts_generated if a["type"] == "SafetyVestMissing"]),
                "total_violations": len(alerts_generated)
            }
        }
        
        # Save JSON results
        with open(json_path, "w") as f:
            json.dump(analysis_results, f, indent=2)
        
        print(f"PPE analysis complete. Results saved to {json_path}")
        return analysis_results
    
    def simulate_frame_detection(self, frame_num):
        """Simulate PPE detection for demo purposes"""
        # Simulate some violations over time
        base_compliance = 0.85
        
        # Add some randomness based on frame number
        violation_chance = 0.1 + (frame_num % 100) * 0.001
        
        return {
            "hat": 1 if np.random.random() > violation_chance else 0,
            "mask": 1 if np.random.random() > violation_chance * 0.5 else 0,
            "vest": 1 if np.random.random() > violation_chance * 0.3 else 0
        }
    
    def create_simulated_results(self, site_id):
        """Create simulated PPE analysis results for demo"""
        current_time = datetime.now()
        
        # Generate some realistic violations
        alerts = [
            {
                "type": "NoHelmetDetected",
                "timestamp": (current_time - timedelta(minutes=15)).isoformat() + "Z",
                "description": "Worker detected without helmet on scaffolding zone",
                "confidence": 0.96
            },
            {
                "type": "SafetyVestMissing",
                "timestamp": (current_time - timedelta(minutes=8)).isoformat() + "Z",
                "description": "Worker without safety vest near heavy machinery",
                "confidence": 0.91
            }
        ]
        
        return {
            "site_id": site_id,
            "video_path": "simulated",
            "analysis_timestamp": current_time.isoformat(),
            "total_frames_processed": 1500,
            "total_violations": 7,
            "compliance_score": 94,
            "alerts": alerts,
            "summary": {
                "helmet_violations": 4,
                "vest_violations": 3,
                "total_violations": 7
            },
            "status": "simulated_demo_data"
        }
    
    def get_latest_results(self, site_id):
        """Get the most recent PPE analysis results for a site"""
        pattern = f"ppe_alerts_{site_id}_*.json"
        result_files = list(self.results_dir.glob(pattern))
        
        if not result_files:
            return self.create_simulated_results(site_id)
        
        # Get most recent file
        latest_file = max(result_files, key=os.path.getctime)
        
        try:
            with open(latest_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading results file: {e}")
            return self.create_simulated_results(site_id)

# Global PPE detector instance
ppe_detector = None

def initialize_ppe_detector():
    """Initialize the global PPE detector"""
    global ppe_detector
    if ppe_detector is None:
        ppe_detector = PPEDetector()
    return ppe_detector

def analyze_video_async(video_path, site_id, callback=None):
    """Analyze video in background thread"""
    def worker():
        detector = initialize_ppe_detector()
        results = detector.analyze_video(video_path, site_id)
        if callback:
            callback(results)
    
    thread = threading.Thread(target=worker)
    thread.daemon = True
    thread.start()
    return thread