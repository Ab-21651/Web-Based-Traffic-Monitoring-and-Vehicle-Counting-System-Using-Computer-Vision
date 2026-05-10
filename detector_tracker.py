"""
Core detection and tracking module.
Reads video, runs YOLOv8 with ByteTrack, outputs structured frame data.
Exposes stream_frames() generator for real-time consumption by Person B.
"""

import json
import time
from pathlib import Path

import cv2
import numpy as np
import torch
from ultralytics import YOLO

import config
from debug_logger import logger


class DetectionTracker:
    """Main detection and tracking pipeline."""

    def __init__(self):
        self.model = None
        self.device = self._get_device()
        self.total_frames_processed = 0
        self.unique_vehicle_ids = set()
        self.inference_times = []

    def _get_device(self):
        """Detect available device: CUDA, ROCm, or CPU."""
        if torch.cuda.is_available():
            device = "cuda"
        elif hasattr(torch, "hip") and torch.hip.is_available():
            device = "cuda"  # ROCm reports as cuda in PyTorch
        else:
            device = "cpu"
        return device

    def load_model(self):
        """Load YOLOv8 model."""
        try:
            logger.log_info(f"Loading YOLOv8 model: {config.YOLO_MODEL}")
            self.model = YOLO(config.YOLO_MODEL)
            self.model.to(self.device)
            logger.log_info(f"Model loaded successfully on {self.device.upper()}")
        except Exception as e:
            logger.log_error(f"Failed to load YOLOv8 model: {e}")
            raise

    def stream_frames(self, video_path):
        """
        Generator that yields frame data in real-time.
        Person B can consume this for live processing.

        Yields:
            tuple: (frame_number, detections_list, frame_with_annotations)
            where detections_list = [
                {"id": int, "class": str, "bbox": [x1,y1,x2,y2], "centroid": [cx,cy]},
                ...
            ]
        """
        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            logger.log_error(f"Cannot open video: {video_path}")
            return

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_num = 0
        frame_count_for_summary = 0
        inference_times_summary = []

        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                frame_num += 1
                frame_count_for_summary += 1

                # TEST_MODE: stop after 100 frames
                if config.TEST_MODE and frame_num > 100:
                    break

                # Resize frame to target dimensions (maintains aspect ratio with padding)
                frame_resized = self._resize_frame(frame, config.FRAME_RESIZE_WIDTH, config.FRAME_RESIZE_HEIGHT)

                logger.log_frame_start(frame_num, total_frames)

                # Run detection + tracking
                try:
                    start_time = time.time()
                    results = self.model.track(
                        frame_resized,
                        persist=True,
                        conf=config.CONFIDENCE_THRESHOLD,
                        iou=config.IOU_THRESHOLD,
                        verbose=False,
                    )
                    inference_ms = (time.time() - start_time) * 1000
                    self.inference_times.append(inference_ms)
                    inference_times_summary.append(inference_ms)

                except Exception as e:
                    logger.log_error(f"Inference failed on frame {frame_num}: {e}")
                    inference_ms = 0
                    results = None

                # Extract detections
                detections = []
                frame_with_boxes = frame_resized.copy()

                if results and len(results) > 0:
                    detections, frame_with_boxes = self._extract_detections(
                        results[0], frame_resized, frame_num
                    )

                self.total_frames_processed = frame_num
                logger.log_frame_detections(frame_num, detections, inference_ms)

                # Log summary every LOG_INTERVAL frames
                if frame_count_for_summary == config.LOG_INTERVAL:
                    avg_inf = np.mean(inference_times_summary) if inference_times_summary else 0
                    logger.log_frame_summary(frame_num, len(detections), avg_inf)
                    inference_times_summary = []
                    frame_count_for_summary = 0

                yield frame_num, detections, frame_with_boxes

        except Exception as e:
            logger.log_error(f"Error in stream_frames at frame {frame_num}: {e}")
            raise
        finally:
            cap.release()

    def process_video(self, video_path, output_video_path, output_json_path):
        """
        Process entire video: run detection/tracking, save annotated video + JSON.
        """
        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            logger.log_error(f"Cannot open video: {video_path}")
            raise ValueError(f"Cannot open video: {video_path}")

        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        # Initialize output video writer
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(str(output_video_path), fourcc, fps, (config.FRAME_RESIZE_WIDTH, config.FRAME_RESIZE_HEIGHT))

        # Collect all frame data for JSON
        all_frames_data = []

        try:
            frame_num = 0
            frame_count_for_summary = 0
            inference_times_summary = []

            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                frame_num += 1
                frame_count_for_summary += 1

                # TEST_MODE: stop after 100 frames
                if config.TEST_MODE and frame_num > 100:
                    break

                # Resize frame
                frame_resized = self._resize_frame(frame, config.FRAME_RESIZE_WIDTH, config.FRAME_RESIZE_HEIGHT)

                logger.log_frame_start(frame_num, total_frames)

                # Run detection + tracking
                try:
                    start_time = time.time()
                    results = self.model.track(
                        frame_resized,
                        persist=True,
                        conf=config.CONFIDENCE_THRESHOLD,
                        iou=config.IOU_THRESHOLD,
                        verbose=False,
                    )
                    inference_ms = (time.time() - start_time) * 1000
                    self.inference_times.append(inference_ms)
                    inference_times_summary.append(inference_ms)

                except Exception as e:
                    logger.log_error(f"Inference failed on frame {frame_num}: {e}")
                    inference_ms = 0
                    results = None

                # Extract detections and draw boxes
                detections = []
                frame_with_boxes = frame_resized.copy()

                if results and len(results) > 0:
                    detections, frame_with_boxes = self._extract_detections(
                        results[0], frame_resized, frame_num
                    )

                self.total_frames_processed = frame_num
                logger.log_frame_detections(frame_num, detections, inference_ms)

                # Write annotated frame to output video
                try:
                    out.write(frame_with_boxes)
                except Exception as e:
                    logger.log_error(f"Failed to write frame {frame_num} to output video: {e}")

                # Store frame data for JSON
                all_frames_data.append({
                    "frame": frame_num,
                    "detections": detections,
                    "inference_ms": inference_ms
                })

                # Log summary every LOG_INTERVAL frames
                if frame_count_for_summary == config.LOG_INTERVAL:
                    avg_inf = np.mean(inference_times_summary) if inference_times_summary else 0
                    logger.log_frame_summary(frame_num, len(detections), avg_inf)
                    inference_times_summary = []
                    frame_count_for_summary = 0

            # Save JSON data
            try:
                with open(output_json_path, "w") as f:
                    json.dump(all_frames_data, f, indent=2)
                logger.log_info(f"Saved detections to JSON: {output_json_path}")
            except Exception as e:
                logger.log_error(f"Failed to save JSON: {e}")

        except Exception as e:
            logger.log_error(f"Error in process_video: {e}")
            raise
        finally:
            cap.release()
            out.release()

    def _resize_frame(self, frame, target_width, target_height):
        """Resize frame to target dimensions, maintaining aspect ratio with letterboxing."""
        h, w = frame.shape[:2]
        scale = min(target_width / w, target_height / h)
        new_w = int(w * scale)
        new_h = int(h * scale)

        resized = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

        # Letterbox (pad to target size)
        canvas = np.zeros((target_height, target_width, 3), dtype=np.uint8)
        offset_x = (target_width - new_w) // 2
        offset_y = (target_height - new_h) // 2
        canvas[offset_y : offset_y + new_h, offset_x : offset_x + new_w] = resized

        return canvas

    def _extract_detections(self, result, frame, frame_num):
        """
        Extract detections from YOLOv8 result, filter to target classes.
        Returns: (detections_list, frame_with_annotations)
        """
        detections = []
        frame_annotated = frame.copy()

        if result.boxes is None or len(result.boxes) == 0:
            return detections, frame_annotated

        try:
            # Get class names from model
            class_names = result.names  # Dict: {class_id: class_name}

            for box in result.boxes:
                cls_id = int(box.cls[0])
                class_name = class_names.get(cls_id, "unknown")

                # Filter to target classes only
                if class_name not in config.TARGET_CLASSES:
                    continue

                # Get tracking ID
                track_id = int(box.id[0]) if box.id is not None else -1
                if track_id != -1:
                    self.unique_vehicle_ids.add(track_id)

                # Get bounding box
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

                # Calculate centroid
                cx = (x1 + x2) / 2
                cy = (y1 + y2) / 2

                # Create detection dict
                detection = {
                    "id": track_id,
                    "class": class_name,
                    "bbox": [x1, y1, x2, y2],
                    "centroid": [cx, cy]
                }
                detections.append(detection)

                # Draw bounding box
                cv2.rectangle(frame_annotated, (x1, y1), (x2, y2), config.BBOX_COLOR, config.BBOX_THICKNESS)

                # Draw label: ID + class name
                label = f"ID:{track_id} {class_name}"
                label_size, baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, config.TEXT_SCALE, config.TEXT_THICKNESS)
                cv2.rectangle(
                    frame_annotated,
                    (x1, y1 - label_size[1] - baseline),
                    (x1 + label_size[0], y1),
                    config.BBOX_COLOR,
                    -1,
                )
                cv2.putText(
                    frame_annotated,
                    label,
                    (x1, y1 - baseline),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    config.TEXT_SCALE,
                    config.TEXT_COLOR,
                    config.TEXT_THICKNESS,
                )

                # Draw centroid
                cv2.circle(frame_annotated, (int(cx), int(cy)), 3, (0, 0, 255), -1)

        except Exception as e:
            logger.log_error(f"Error extracting detections from frame {frame_num}: {e}")

        return detections, frame_annotated


def create_tracker():
    """Factory function to create DetectionTracker."""
    tracker = DetectionTracker()
    tracker.load_model()
    return tracker
