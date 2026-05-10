"""
Enhanced Counting logic and traffic analytics module.
Generates full metric suite for React Frontend.
"""

import time
from collections import deque, Counter
import cv2
import config

class TrafficAnalytics:
    def __init__(self, fps=30):
        self.fps = fps
        self.trajectories = {}  # {track_id: deque of centroids}
        self.crossed_ids = set()  # IDs that have already crossed the line
        
        # General Counts
        self.total_count = 0
        self.counts_by_class = Counter()
        self.incoming = 0
        self.outgoing = 0
        
        # Time-based analytics
        self.start_time = time.time()
        self.cross_events = []  # [(timestamp, id, class, direction)]
        self.time_series = {}  # {minute_index: count}
        
        # Real-time metrics
        self.current_density = 0
        self.max_seen_density = 0

    def update(self, frame_num, detections):
        """
        Update analytics with new frame data.
        """
        self.current_density = len(detections)
        if self.current_density > self.max_seen_density:
            self.max_seen_density = self.current_density
            
        current_video_time = frame_num / self.fps
        line_y = int(config.FRAME_RESIZE_HEIGHT * config.COUNTING_LINE_Y)

        for det in detections:
            track_id = det["id"]
            centroid = det["centroid"]
            cls_name = det["class"]

            if track_id not in self.trajectories:
                self.trajectories[track_id] = deque(maxlen=config.MAX_TRAJECTORY_POINTS)
            
            prev_pos = self.trajectories[track_id][-1] if self.trajectories[track_id] else None
            self.trajectories[track_id].append(centroid)

            # Check for line crossing
            if track_id != -1 and track_id not in self.crossed_ids and prev_pos:
                prev_y = prev_pos[1]
                curr_y = centroid[1]

                # Crossing Logic
                direction = None
                if prev_y < line_y <= curr_y:
                    direction = "OUT"
                    self.outgoing += 1
                elif curr_y < line_y <= prev_y:
                    direction = "IN"
                    self.incoming += 1

                if direction:
                    self.total_count += 1
                    self.crossed_ids.add(track_id)
                    self.counts_by_class[cls_name] += 1
                    
                    # Record event
                    event_time = current_video_time
                    self.cross_events.append({
                        "id": track_id,
                        "type": self._map_class_name(cls_name),
                        "direction": direction,
                        "timestamp": self._format_timestamp(event_time)
                    })
                    
                    # Update Time Series (bin by minute)
                    minute_idx = int(event_time / 60)
                    self.time_series[minute_idx] = self.time_series.get(minute_idx, 0) + 1

        return self.get_metrics()

    def _map_class_name(self, cls):
        mapping = {
            "car": "Car",
            "motorcycle": "Bike",
            "truck": "Truck",
            "bus": "Bus"
        }
        return mapping.get(cls.lower(), "Car")

    def _format_timestamp(self, seconds):
        mins = int(seconds // 60)
        secs = int(seconds % 60)
        return f"{mins:02d}:{secs:02d}"

    def get_metrics(self):
        """Calculate full metrics for Frontend."""
        
        # Calculate Density Label
        density_label = "Low"
        if self.current_density > 15: density_label = "High"
        elif self.current_density > 8: density_label = "Medium"
        
        # Peak Time Calculation
        peak_minute = 0
        max_flow = 0
        for m, count in self.time_series.items():
            if count > max_flow:
                max_flow = count
                peak_minute = m
        
        peak_time_str = f"Minute {peak_minute}" if self.time_series else "N/A"

        # Format Time Series for Charts
        formatted_ts = []
        for i in range(max(self.time_series.keys()) + 1 if self.time_series else 1):
            formatted_ts.append({"t": f"{i}m", "count": self.time_series.get(i, 0)})

        # Congestion Calculation (mock level for now based on current density)
        congestion_level = min(100, int((self.current_density / 20) * 100))
        
        return {
            "totalVehicles": self.total_count,
            "cars": self.counts_by_class["car"],
            "bikes": self.counts_by_class["motorcycle"],
            "trucks": self.counts_by_class["truck"],
            "buses": self.counts_by_class["bus"],
            "incoming": self.incoming,
            "outgoing": self.outgoing,
            "peakTime": peak_time_str,
            "density": density_label,
            "detections": self.cross_events[-15:], # Last 15 events
            "timeSeries": formatted_ts,
            "congestion": [{"t": f"{i*5}s", "level": min(100, int((self.current_density + i) % 100))} for i in range(12)] # Dynamic mock for chart
        }

    def draw_analytics(self, frame):
        line_y = int(config.FRAME_RESIZE_HEIGHT * config.COUNTING_LINE_Y)
        cv2.line(frame, (0, line_y), (config.FRAME_RESIZE_WIDTH, line_y), config.COUNTING_LINE_COLOR, config.COUNTING_LINE_THICKNESS)
        
        metrics = self.get_metrics()
        overlay_text = [
            f"Total: {metrics['totalVehicles']}",
            f"IN: {metrics['incoming']} | OUT: {metrics['outgoing']}",
            f"Density: {metrics['density']}"
        ]
        
        for i, text in enumerate(overlay_text):
            cv2.putText(frame, text, (10, 30 + i*30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, config.METRICS_COLOR, 2)
        
        return frame
