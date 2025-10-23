#!/usr/bin/env python3
"""
Example script showing how to process videos with the PPE detector
"""

import os
import sys
from pathlib import Path

# Add the path to your ppe_detector
sys.path.append('/Users/aayushpatel/Desktop/RU Hack/flask-video-server')
from ppe_detector import PPEDetector, initialize_ppe_detector

def process_single_video():
    """Process a single video file"""
    # Initialize the detector
    detector = initialize_ppe_detector()
    
    # Example video path - replace with your actual video
    video_path = "sample_construction_video.mp4"
    site_id = "SITE_001"
    
    if os.path.exists(video_path):
        print(f"Processing video: {video_path}")
        results = detector.analyze_video(video_path, site_id)
        
        print("Analysis Results:")
        print(f"Compliance Score: {results['compliance_score']}%")
        print(f"Total Violations: {results['total_violations']}")
        print(f"Helmet Violations: {results['summary']['helmet_violations']}")
        print(f"Vest Violations: {results['summary']['vest_violations']}")
        
        return results
    else:
        print(f"Video file not found: {video_path}")
        print("Running with simulated data instead...")
        return detector.create_simulated_results(site_id)

def process_multiple_videos():
    """Process multiple video files"""
    detector = initialize_ppe_detector()
    
    # Video directory - place your videos here
    video_dir = Path("construction_videos")
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv']
    
    if not video_dir.exists():
        print(f"Creating video directory: {video_dir}")
        video_dir.mkdir(exist_ok=True)
        print("Place your construction site videos in this directory")
        return
    
    # Find all video files
    video_files = []
    for ext in video_extensions:
        video_files.extend(video_dir.glob(f"*{ext}"))
    
    if not video_files:
        print("No video files found. Supported formats: .mp4, .avi, .mov, .mkv")
        return
    
    results = []
    for i, video_file in enumerate(video_files):
        site_id = f"SITE_{str(i+1).zfill(3)}"
        print(f"\nProcessing {video_file.name} for {site_id}...")
        
        result = detector.analyze_video(str(video_file), site_id)
        results.append(result)
        
        print(f"✅ Completed: {result['compliance_score']}% compliance")
    
    return results

def test_api_endpoints():
    """Test the PPE detection via API calls"""
    import requests
    import json
    
    base_url = "http://localhost:2000"
    
    try:
        # Check system status
        print("Checking PPE system status...")
        response = requests.get(f"{base_url}/api/ppe/status")
        if response.ok:
            status = response.json()
            print(f"YOLO Available: {status['yolo_available']}")
            print(f"Model Loaded: {status['model_loaded']}")
            print(f"ImageIO Available: {status['imageio_available']}")
        
        # Start analysis for a site
        print("\nStarting PPE analysis for SITE_001...")
        response = requests.post(f"{base_url}/api/ppe/analyze/SITE_001")
        if response.ok:
            results = response.json()
            print(f"Analysis complete: {results['compliance_score']}% compliance")
            print(f"Total violations: {results['total_violations']}")
        
        # Get results
        print("\nRetrieving analysis results...")
        response = requests.get(f"{base_url}/api/ppe/results/SITE_001")
        if response.ok:
            results = response.json()
            print(f"Latest results: {results['compliance_score']}% compliance")
        
    except requests.exceptions.ConnectionError:
        print("❌ Flask server not running. Start it with: python app.py")
    except Exception as e:
        print(f"❌ Error testing API: {e}")

if __name__ == "__main__":
    print("🦺 PPE Video Processing Examples")
    print("=" * 40)
    
    print("\n1. Testing API Endpoints...")
    test_api_endpoints()
    
    print("\n2. Processing Single Video...")
    process_single_video()
    
    print("\n3. Processing Multiple Videos...")
    process_multiple_videos()
    
    print("\n✅ Processing examples complete!")