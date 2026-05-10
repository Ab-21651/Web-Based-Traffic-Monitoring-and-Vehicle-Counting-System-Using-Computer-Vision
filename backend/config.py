"""
Configuration parameters for the Detection & Tracking module.
"""

import os
from pathlib import Path

# ============================================================================
# FILE PATHS
# ============================================================================
BACKEND_ROOT = Path(__file__).parent
UPLOAD_DIR = BACKEND_ROOT / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

INPUT_VIDEO = str(UPLOAD_DIR / "input_video.mp4")
OUTPUT_VIDEO = str(UPLOAD_DIR / "output_video.mp4")
OUTPUT_JSON = str(UPLOAD_DIR / "detections.json")
DEBUG_LOG = str(BACKEND_ROOT / "debug.log")

# ============================================================================
# MODEL PARAMETERS
# ============================================================================
YOLO_MODEL = "yolov8s.pt"

# Target vehicle classes (COCO dataset indices)
# 2=car, 5=bus, 7=truck, 3=motorcycle
TARGET_CLASSES = ["car", "bus", "truck", "motorcycle"]
TARGET_CLASS_IDS = {2, 5, 7, 3}

# Detection thresholds
CONFIDENCE_THRESHOLD = 0.45
IOU_THRESHOLD = 0.5

# ============================================================================
# VIDEO PROCESSING
# ============================================================================
FRAME_RESIZE_WIDTH = 640
FRAME_RESIZE_HEIGHT = 480

# Bounding box drawing
BBOX_COLOR = (0, 255, 0)
BBOX_THICKNESS = 2
TEXT_COLOR = (255, 255, 255)
TEXT_SCALE = 0.6
TEXT_THICKNESS = 1
TEXT_SCALE_METRICS = 0.8
METRICS_COLOR = (0, 255, 255)

# ============================================================================
# RUNTIME FLAGS
# ============================================================================
TEST_MODE = False
DEBUG_MODE = False

# Counting Logic
COUNTING_LINE_Y = 0.6
COUNTING_LINE_COLOR = (0, 0, 255)
COUNTING_LINE_THICKNESS = 2
FLOW_RATE_WINDOW_MINUTES = 1
DRAW_TRAJECTORIES = True
MAX_TRAJECTORY_POINTS = 30

# ============================================================================
# LOGGING
# ============================================================================
LOG_INTERVAL = 10
