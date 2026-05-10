"""
Centralized debug logging utility.
"""

import logging
import sys
from pathlib import Path

import cv2
import torch

import config


class DebugLogger:
    """Unified logger for console + file output."""

    def __init__(self, log_file=config.DEBUG_LOG):
        self.log_file = log_file
        self.logger = self._setup_logger(log_file)
        self.frame_count = 0
        self.frame_inference_times = []

    def _setup_logger(self, log_file):
        """Create logger that writes to both console and file."""
        logger = logging.getLogger("DetectionTracker")
        logger.setLevel(logging.DEBUG)

        # Remove any existing handlers to avoid duplicates
        logger.handlers = []

        # File handler: logs everything
        file_handler = logging.FileHandler(log_file, mode="w")
        file_handler.setLevel(logging.DEBUG)
        file_format = logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        file_handler.setFormatter(file_format)
        logger.addHandler(file_handler)

        # Console handler: respects DEBUG_MODE
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_format = logging.Formatter(
            "%(message)s"  # Clean console output
        )
        console_handler.setFormatter(console_format)
        logger.addHandler(console_handler)

        return logger

    def log_system_info(self):
        """Log system configuration at startup."""
        import platform

        py_version = platform.python_version()
        torch_version = torch.__version__
        cv_version = cv2.__version__

        # Check device availability
        cuda_available = torch.cuda.is_available()
        if cuda_available:
            device_name = torch.cuda.get_device_name(0)
            device_info = f"CUDA GPU: {device_name}"
        else:
            device_info = "CPU (no CUDA detected)"

        # Try to detect ROCm/HIP
        rocm_available = hasattr(torch, "hip") and torch.hip.is_available() if hasattr(torch, "hip") else False
        if rocm_available:
            device_info = f"ROCm GPU available"

        info_msg = (
            f"\n{'='*70}\n"
            f"SYSTEM INFORMATION\n"
            f"{'='*70}\n"
            f"Python Version:      {py_version}\n"
            f"PyTorch Version:     {torch_version}\n"
            f"OpenCV Version:      {cv_version}\n"
            f"Device:              {device_info}\n"
            f"{'='*70}\n"
        )
        self.logger.info(info_msg)

    def log_frame_start(self, frame_num, total_frames):
        """Log frame processing start."""
        if config.DEBUG_MODE:
            self.logger.debug(f"Processing frame {frame_num}/{total_frames}")

    def log_frame_detections(self, frame_num, detections, inference_ms):
        """Log per-frame detection results."""
        if config.DEBUG_MODE:
            num_vehicles = len(detections)
            self.logger.debug(f"  Frame {frame_num}: {num_vehicles} vehicles | Inference: {inference_ms:.1f}ms")
            for det in detections:
                self.logger.debug(
                    f"    ID={det['id']} Class={det['class']} BBox={det['bbox']} Centroid={det['centroid']}"
                )

    def log_frame_summary(self, frame_num, total_vehicles, avg_inference_ms):
        """Log summary every LOG_INTERVAL frames."""
        if not config.DEBUG_MODE:
            self.logger.info(f"[Frame {frame_num}] Vehicles detected: {total_vehicles} | Avg inference: {avg_inference_ms:.1f}ms")

    def log_info(self, msg):
        self.logger.info(msg)

    def log_warning(self, msg):
        self.logger.warning(msg)

    def log_error(self, msg):
        self.logger.error(msg)

    def log_exception(self, msg, exc):
        self.logger.exception(f"{msg}\n{exc}")

    def log_completion(self, total_frames, total_unique_ids, avg_inference_ms, output_video, output_json):
        summary = (
            f"\n{'='*70}\n"
            f"PIPELINE COMPLETED\n"
            f"{'='*70}\n"
            f"Total frames processed: {total_frames}\n"
            f"Total unique vehicles:  {total_unique_ids}\n"
            f"Average inference time: {avg_inference_ms:.1f}ms\n"
            f"Output video:           {output_video}\n"
            f"Output JSON:            {output_json}\n"
            f"{'='*70}\n"
        )
        self.logger.info(summary)


# Global logger instance
logger = DebugLogger()
