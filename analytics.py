"""
Counting logic and traffic analytics module (Member 2).
Handles line-crossing detection, trajectory tracking, and metric generation.
"""

import time
from collections import deque
import cv2
import config

class TrafficAnalytics:
    def __init__(self, fps=30):
        self.fps = fps
        self.trajectories = {}  # {track_id: deque of centroids}
        self.crossed_ids = set()  # IDs that have already crossed the line
        self.total_count = 0
        
        # Performance metrics
        self.frame_times = deque(maxlen=int(fps * 60 * config.FLOW_RATE_WINDOW_MINUTES))
        self.cross_events = []  # Timestamps of crossing events [(timestamp, id), ...]
        self.current_density = 0

    def update(self, frame_num, detections):
        """
        Update analytics with new frame data.
        Returns:
            dict: Current metrics for Member 3
        """
        self.current_density = len(detections)
        current_time = time.time()
        
        # Calculate counting line Y coordinate
        line_y = int(config.FRAME_RESIZE_HEIGHT * config.COUNTING_LINE_Y)

        for det in detections:
            track_id = det["id"]
            centroid = det["centroid"]  # [cx, cy]

            # 1. Update trajectory
            if track_id not in self.trajectories:
                self.trajectories[track_id] = deque(maxlen=config.MAX_TRAJECTORY_POINTS)
            
            # Record previous position before adding new one
            prev_pos = self.trajectories[track_id][-1] if self.trajectories[track_id] else None
            self.trajectories[track_id].append(centroid)

            # 2. Check for line crossing
            # Only count if we have a previous position and haven't counted this ID yet
            if track_id != -1 and track_id not in self.crossed_ids and prev_pos:
                prev_y = prev_pos[1]
                curr_y = centroid[1]

                # Detect crossing from either direction
                if (prev_y < line_y <= curr_y) or (curr_y < line_y <= prev_y):
                    self.total_count += 1
                    self.crossed_ids.add(track_id)
                    self.cross_events.append(current_time)
                    
        # 3. Clean up old trajectories (optional: keep only active ones)
        active_ids = {det["id"] for det in detections}
        # In a real system, we'd prune trajectories of IDs not seen for X frames
        # to prevent memory leaks, but for this project we'll keep it simple.

        return self.get_metrics()

    def get_metrics(self):
        """Calculate metrics for Member 3."""
        current_time = time.time()
        
        # Prune crossing events outside the window
        window_sec = config.FLOW_RATE_WINDOW_MINUTES * 60
        self.cross_events = [t for t in self.cross_events if current_time - t <= window_sec]
        
        flow_rate = len(self.cross_events)  # vehicles per window

        return {
            "total_count": self.total_count,
            "flow_rate": flow_rate,
            "vehicles_in_frame": self.current_density
        }

    def draw_analytics(self, frame):
        """Draw counting line, trajectories, and metrics on the frame."""
        line_y = int(config.FRAME_RESIZE_HEIGHT * config.COUNTING_LINE_Y)
        
        # 1. Draw counting line
        cv2.line(
            frame, 
            (0, line_y), 
            (config.FRAME_RESIZE_WIDTH, line_y), 
            config.COUNTING_LINE_COLOR, 
            config.COUNTING_LINE_THICKNESS
        )
        cv2.putText(
            frame, "COUNTING LINE", (10, line_y - 10),
            cv2.FONT_HERSHEY_SIMPLEX, 0.5, config.COUNTING_LINE_COLOR, 1
        )

        # 2. Draw trajectories
        if config.DRAW_TRAJECTORIES:
            for track_id, points in self.trajectories.items():
                if len(points) > 1:
                    for i in range(1, len(points)):
                        pt1 = (int(points[i-1][0]), int(points[i-1][1]))
                        pt2 = (int(points[i][0]), int(points[i][1]))
                        cv2.line(frame, pt1, pt2, (255, 255, 0), 1)

        # 3. Draw metrics overlay
        metrics = self.get_metrics()
        overlay_text = [
            f"Total Count: {metrics['total_count']}",
            f"Flow Rate: {metrics['flow_rate']} vpm",
            f"Density: {metrics['vehicles_in_frame']}"
        ]
        
        for i, text in enumerate(overlay_text):
            y_pos = 30 + (i * 30)
            cv2.putText(
                frame, text, (10, y_pos),
                cv2.FONT_HERSHEY_SIMPLEX, config.TEXT_SCALE_METRICS, 
                config.METRICS_COLOR, 2
            )
        
        return frame
