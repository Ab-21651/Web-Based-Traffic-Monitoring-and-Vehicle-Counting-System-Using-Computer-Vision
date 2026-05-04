"""
Pre-run validation checks. Ensures all dependencies, files, and device configs are ready.
Prints PASS/FAIL report before pipeline starts.
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
        """Record a check result."""
        status = "✓ PASS" if passed else "✗ FAIL"
        self.checks.append({"name": name, "passed": passed, "error": error_msg, "status": status})

    def check_video_file(self):
        """Verify input video exists and is readable."""
        try:
            video_path = Path(config.INPUT_VIDEO)
            if not video_path.exists():
                self.add_check("Video file exists", False, f"File not found: {config.INPUT_VIDEO}")
                return False

            # Try to open with OpenCV
            cap = cv2.VideoCapture(str(video_path))
            if not cap.isOpened():
                self.add_check("Video file readable", False, f"Cannot open video: {config.INPUT_VIDEO}")
                cap.release()
                return False

            # Get frame count
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
        """Verify YOLOv8 weights available (or can be downloaded)."""
        try:
            # Try to load the model; Ultralytics will auto-download if missing
            model = YOLO(config.YOLO_MODEL)
            self.add_check("YOLOv8 weights available", True, "(auto-downloaded if needed)")
            return True
        except Exception as e:
            self.add_check("YOLOv8 weights available", False, str(e))
            return False

    def check_output_directories(self):
        """Verify output directories exist and are writable."""
        try:
            # Check video output directory
            video_out_dir = Path(config.OUTPUT_VIDEO).parent
            video_out_dir.mkdir(parents=True, exist_ok=True)

            # Check JSON output directory
            json_out_dir = Path(config.OUTPUT_JSON).parent
            json_out_dir.mkdir(parents=True, exist_ok=True)

            # Try to write a test file
            test_file = video_out_dir / ".write_test"
            test_file.write_text("test")
            test_file.unlink()

            self.add_check("Output directories writable", True)
            return True
        except Exception as e:
            self.add_check("Output directories writable", False, str(e))
            return False

    def check_pytorch_device(self):
        """Verify PyTorch device (CUDA, ROCm, or CPU)."""
        try:
            if torch.cuda.is_available():
                device = "CUDA GPU"
                device_name = torch.cuda.get_device_name(0)
                self.add_check("PyTorch device", True, f"{device}: {device_name}")
            elif hasattr(torch, "hip") and torch.hip.is_available():
                self.add_check("PyTorch device", True, "ROCm GPU")
            else:
                self.add_check("PyTorch device", True, "CPU (fallback)")
            return True
        except Exception as e:
            self.add_check("PyTorch device", False, str(e))
            return False

    def print_report(self):
        """Print validation report."""
        print("\n" + "=" * 70)
        print("PRE-RUN VALIDATION REPORT")
        print("=" * 70)

        for check in self.checks:
            error_str = f" — {check['error']}" if check["error"] else ""
            print(f"{check['status']:10s} | {check['name']:30s}{error_str}")

        print("=" * 70)

        all_passed = all(c["passed"] for c in self.checks)
        if all_passed:
            print("All checks passed. Starting pipeline...\n")
        else:
            print("\n⚠️  Some checks failed. See above for details.\n")

        return all_passed

    def run_all(self):
        """Run all validation checks."""
        self.check_video_file()
        self.check_yolo_weights()
        self.check_output_directories()
        self.check_pytorch_device()
        passed = self.print_report()

        if not passed:
            sys.exit(1)


def validate():
    """Entry point for validation."""
    validator = Validator()
    validator.run_all()
