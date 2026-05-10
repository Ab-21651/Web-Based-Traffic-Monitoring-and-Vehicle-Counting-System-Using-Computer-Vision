"""
Configuration parameters for the Detection & Tracking module.
All paths, thresholds, and feature flags are centralized here.
"""

import os
from pathlib import Path

# ============================================================================
# FILE PATHS
# ============================================================================
PROJECT_ROOT = Path(__file__).parent
INPUT_VIDEO = os.getenv("INPUT_VIDEO", str(PROJECT_ROOT / "input_video.mp4"))
OUTPUT_VIDEO = os.getenv("OUTPUT_VIDEO", str(PROJECT_ROOT / "output_video.mp4"))
OUTPUT_JSON = os.getenv("OUTPUT_JSON", str(PROJECT_ROOT / "detections.json"))
DEBUG_LOG = os.getenv("DEBUG_LOG", str(PROJECT_ROOT / "debug.log"))

# ============================================================================
# MODEL PARAMETERS
# ============================================================================
YOLO_MODEL = "yolov8s.pt"  # Ultralytics will auto-download if missing

# Target vehicle classes (COCO dataset indices)
# 2=car, 5=bus, 7=truck, 3=motorcycle
TARGET_CLASSES = ["car", "bus", "truck", "motorcycle"]
TARGET_CLASS_IDS = {2, 5, 7, 3}  # COCO IDs for target classes

# Detection thresholds
CONFIDENCE_THRESHOLD = 0.45  # YOLOv8 detection confidence
IOU_THRESHOLD = 0.5  # Non-Maximum Suppression IOU threshold

# ============================================================================
# VIDEO PROCESSING
# ============================================================================
FRAME_RESIZE_WIDTH = 640  # Resize frames to this width (maintains aspect ratio)
FRAME_RESIZE_HEIGHT = 480  # Resize frames to this height

# Bounding box drawing
BBOX_COLOR = (0, 255, 0)  # BGR format: green
BBOX_THICKNESS = 2
TEXT_COLOR = (255, 255, 255)  # White text
TEXT_SCALE = 0.6
TEXT_THICKNESS = 1

# ============================================================================
# RUNTIME FLAGS
# ============================================================================
TEST_MODE = False  # If True, process only first 100 frames then exit
DEBUG_MODE = False  # If True, log per-frame details; if False, summary every 10 frames

# ============================================================================
# LOGGING
# ============================================================================
LOG_INTERVAL = 10  # Print summary every N frames when DEBUG_MODE=False
