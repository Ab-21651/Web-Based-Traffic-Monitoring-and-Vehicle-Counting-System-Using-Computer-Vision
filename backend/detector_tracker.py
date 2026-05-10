"""
Core detection and tracking module.
"""

import json
import time
import cv2
import numpy as np
import torch
from ultralytics import YOLO

import config
from debug_logger import logger
from analytics import TrafficAnalytics


class DetectionTracker:
    def __init__(self):
        self.model = None
        self.device = self._get_device()
        self.analytics = None
        self.inference_times = []
        self.total_frames_processed = 0

    def _get_device(self):
        if torch.cuda.is_available(): return "cuda"
        return "cpu"

    def load_model(self):
        logger.log_info(f"Loading YOLOv8 model: {config.YOLO_MODEL}")
        self.model = YOLO(config.YOLO_MODEL)
        self.model.to(self.device)

    def process_video(self, video_path):
        """
        Processes video and yields progress updates + final results.
        """
        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            raise ValueError(f"Cannot open video: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.analytics = TrafficAnalytics(fps=fps)
        
        # Prepare video writer for processed output
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(config.OUTPUT_VIDEO, fourcc, fps, (config.FRAME_RESIZE_WIDTH, config.FRAME_RESIZE_HEIGHT))

        frame_num = 0
        try:
            while True:
                ret, frame = cap.read()
                if not ret: break

                frame_num += 1
                if config.TEST_MODE and frame_num > 100: break

                frame_resized = self._resize_frame(frame, config.FRAME_RESIZE_WIDTH, config.FRAME_RESIZE_HEIGHT)

                # Inference
                start_time = time.time()
                results = self.model.track(
                    frame_resized, persist=True, conf=config.CONFIDENCE_THRESHOLD, iou=config.IOU_THRESHOLD, verbose=False
                )
                self.inference_times.append((time.time() - start_time) * 1000)

                detections = []
                if results and len(results) > 0:
                    detections = self._extract_detections(results[0])

                # Update Analytics
                metrics = self.analytics.update(frame_num, detections)
                
                # Annotate and Write
                annotated_frame = self._annotate_frame(frame_resized, detections)
                annotated_frame = self.analytics.draw_analytics(annotated_frame)
                out.write(annotated_frame)

                self.total_frames_processed = frame_num
                
                # Yield progress for FastAPI to communicate to frontend
                yield {
                    "stage": "Processing Frames",
                    "progress": int((frame_num / total_frames) * 100),
                    "metrics": metrics
                }

            # Finalize
            with open(config.OUTPUT_JSON, "w") as f:
                json.dump(metrics, f, indent=2)

        finally:
            cap.release()
            out.release()

    def _resize_frame(self, frame, tw, th):
        h, w = frame.shape[:2]
        scale = min(tw/w, th/h)
        nw, nh = int(w*scale), int(h*scale)
        resized = cv2.resize(frame, (nw, nh))
        canvas = np.zeros((th, tw, 3), dtype=np.uint8)
        canvas[(th-nh)//2 : (th-nh)//2 + nh, (tw-nw)//2 : (tw-nw)//2 + nw] = resized
        return canvas

    def _extract_detections(self, result):
        detections = []
        if result.boxes is None: return detections
        
        names = result.names
        for box in result.boxes:
            cls_id = int(box.cls[0])
            cls_name = names.get(cls_id, "unknown")
            if cls_name not in config.TARGET_CLASSES: continue

            track_id = int(box.id[0]) if box.id is not None else -1
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])

            detections.append({
                "id": track_id,
                "class": cls_name,
                "bbox": [int(x1), int(y1), int(x2), int(y2)],
                "centroid": [(x1+x2)/2, (y1+y2)/2],
                "confidence": conf
            })
        return detections

    def _annotate_frame(self, frame, detections):
        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            cv2.rectangle(frame, (x1, y1), (x2, y2), config.BBOX_COLOR, 2)
            cv2.putText(frame, f"ID:{det['id']} {det['class']}", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, config.BBOX_COLOR, 1)
        return frame


def create_tracker():
    tracker = DetectionTracker()
    tracker.load_model()
    return tracker
