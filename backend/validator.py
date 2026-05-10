"""
Pre-run validation checks.
"""

import sys
from pathlib import Path

import cv2
import torch
from ultralytics import YOLO

import config


class Validator:
    """Runs sanity checks before pipeline execution."""

    def __init__(self):
        self.checks = []

    def add_check(self, name, passed, error_msg=None):
        status = "✓ PASS" if passed else "✗ FAIL"
        self.checks.append({"name": name, "passed": passed, "error": error_msg, "status": status})

    def check_video_file(self):
        try:
            video_path = Path(config.INPUT_VIDEO)
            if not video_path.exists():
                self.add_check("Video file exists", False, f"File not found: {config.INPUT_VIDEO}")
                return False

            cap = cv2.VideoCapture(str(video_path))
            if not cap.isOpened():
                self.add_check("Video file readable", False, f"Cannot open video: {config.INPUT_VIDEO}")
                cap.release()
                return False

            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            cap.release()

            if frame_count == 0:
                self.add_check("Video has frames", False, "Video file is empty or corrupted")
                return False

            self.add_check("Video file readable", True, f"({frame_count} frames)")
            return True
        except Exception as e:
            self.add_check("Video file readable", False, str(e))
            return False

    def check_yolo_weights(self):
        try:
            # Ultralytics will auto-download if missing
            model = YOLO(config.YOLO_MODEL)
            self.add_check("YOLOv8 weights available", True)
            return True
        except Exception as e:
            self.add_check("YOLOv8 weights available", False, str(e))
            return False

    def check_output_directories(self):
        try:
            video_out_dir = Path(config.OUTPUT_VIDEO).parent
            video_out_dir.mkdir(parents=True, exist_ok=True)
            self.add_check("Output directories writable", True)
            return True
        except Exception as e:
            self.add_check("Output directories writable", False, str(e))
            return False

    def check_pytorch_device(self):
        try:
            if torch.cuda.is_available():
                device_name = torch.cuda.get_device_name(0)
                self.add_check("PyTorch device", True, f"CUDA: {device_name}")
            else:
                self.add_check("PyTorch device", True, "CPU (fallback)")
            return True
        except Exception as e:
            self.add_check("PyTorch device", False, str(e))
            return False

    def run_all(self, exit_on_fail=True):
        self.check_video_file()
        self.check_yolo_weights()
        self.check_output_directories()
        self.check_pytorch_device()
        
        all_passed = all(c["passed"] for c in self.checks)
        if not all_passed and exit_on_fail:
            sys.exit(1)
        return all_passed


def validate(exit_on_fail=True):
    validator = Validator()
    return validator.run_all(exit_on_fail)
