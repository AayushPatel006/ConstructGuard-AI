#!/bin/bash

echo "Setting up ConstructGuard-AI Video Server..."

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

echo "Setup complete!"
echo ""
echo "To start the video server:"
echo "1. cd /Users/aayushpatel/Desktop/RU Hack/flask-video-server/"
echo "2. source venv/bin/activate"
echo "3. python app.py"
echo ""
echo "The video server will be available at: http://localhost:5000"