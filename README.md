# Detection & Tracking Module (Person A)

Production-ready person/vehicle detection and tracking for traffic monitoring systems. Built with YOLOv8 + ByteTrack, with full ROCm/AMD GPU support and CPU fallback.

## Features

- **YOLOv8s Detection** with ByteTrack persistent ID assignment
- **Vehicle-Only Filtering**: car, bus, truck, motorcycle
- **Real-time Streaming**: `stream_frames()` generator for Person B consumption
- **Structured Output**: JSON per-frame + annotated video
- **AMD GPU Support**: Full ROCm integration with automatic CPU fallback
- **Robust Error Handling**: Handles bad frames, inference failures, disk I/O errors
- **Debug Logging**: Per-frame details (verbose) or summary every 10 frames (quiet)
- **Test Mode**: Process only first 100 frames for quick validation

---

## Project Structure

```
.
├── main.py                    # Entry point (orchestrator)
├── detector_tracker.py        # Core detection/tracking engine
├── config.py                  # All configurable parameters
├── debug_logger.py            # Centralized logging
├── validator.py               # Pre-run sanity checks
├── requirements.txt           # Dependencies + PyTorch install notes
├── input_video.mp4            # Your traffic video (not included)
├── output_video.mp4           # Annotated video output
├── detections.json            # Per-frame structured detections
└── debug.log                  # Detailed execution log
```

---

## Installation

### 1. **Clone or Extract This Module**

```bash
cd /path/to/this/module
```

### 2. **Install Base Dependencies**

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This installs everything EXCEPT PyTorch. You'll install PyTorch separately based on your hardware.

### 3. **Install PyTorch**

Choose ONE command below based on your hardware:

#### **Option A: AMD GPU (ROCm) — Recommended for your setup**

First, verify your ROCm installation:

```bash
# Check if ROCm is installed
rocm-smi
# Output should show your AMD GPU info
```

Then install PyTorch for ROCm 5.7:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.7
```

**If you have ROCm 5.6 instead**, use:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.6
```

#### **Option B: CPU Only (Fallback if ROCm not available)**

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

#### **Option C: NVIDIA GPU (CUDA 11.8)**

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### 4. **Verify Installation**

```bash
python -c "import torch; print('PyTorch:', torch.__version__); print('Device:', 'CUDA' if torch.cuda.is_available() else 'CPU')"
```

---

## Quick Start

### Get a Sample Traffic Video

Download a free traffic video from one of these sources:

- **Pexels Videos** (free): https://www.pexels.com/search/traffic/
  - Search for "traffic" or "road", download any MP4
  
- **Pixabay Videos** (free): https://pixabay.com/videos/
  
- **YouTube** (with youtube-dl):
  ```bash
  pip install yt-dlp
  yt-dlp -f mp4 -o "traffic.mp4" "https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
  ```

Save it as `input_video.mp4` in this directory.

### Run Pipeline

```bash
python main.py
```

**Expected output:**

```
======================================================================
PRE-RUN VALIDATION REPORT
======================================================================
✓ PASS | Video file readable              — (450 frames)
✓ PASS | YOLOv8 weights available         — (auto-downloaded if needed)
✓ PASS | Output directories writable      
✓ PASS | PyTorch device                   — CUDA GPU: AMD Radeon RX 7900 XT
======================================================================
All checks passed. Starting pipeline...

======================================================================
SYSTEM INFORMATION
======================================================================
Python Version:      3.10.12
PyTorch Version:     2.1.1+rocm5.7
OpenCV Version:      4.8.1
Device:              ROCm GPU
======================================================================

[Frame 10] Vehicles detected: 4 | Avg inference: 23ms
[Frame 20] Vehicles detected: 5 | Avg inference: 24ms
...
======================================================================
PIPELINE COMPLETED
======================================================================
Total frames processed: 450
Total unique vehicles:  187
Average inference time: 23.5ms
Output video:          ./output_video.mp4
Output JSON:           ./detections.json
======================================================================
```

### Test Mode

Run on just the first 100 frames:

```bash
# Edit config.py, set TEST_MODE = True
# Then:
python main.py
```

Output will show:

```
======================================================================
[TEST MODE] Running on first 100 frames only
======================================================================
```

---

## Configuration

Edit `config.py` to customize:

```python
# File paths
INPUT_VIDEO = "traffic_video.mp4"
OUTPUT_VIDEO = "output_annotated.mp4"
OUTPUT_JSON = "detections_output.json"

# Detection parameters
CONFIDENCE_THRESHOLD = 0.45  # Lower = more detections (but more false positives)
IOU_THRESHOLD = 0.5         # Non-Maximum Suppression threshold
TARGET_CLASSES = ["car", "bus", "truck", "motorcycle"]

# Video processing
FRAME_RESIZE_WIDTH = 640
FRAME_RESIZE_HEIGHT = 480

# Runtime flags
TEST_MODE = False          # Process only 100 frames
DEBUG_MODE = False         # Verbose per-frame logging (vs. summary every 10 frames)
```

---

## Output Format

### Annotated Video (`output_video.mp4`)

Each frame shows:
- Green bounding boxes around vehicles
- Label: `ID:123 car` (unique tracking ID + class)
- Red dot at centroid

### Detections JSON (`detections.json`)

```json
[
  {
    "frame": 1,
    "detections": [
      {
        "id": 12,
        "class": "car",
        "bbox": [154, 230, 412, 398],
        "centroid": [283.0, 314.0]
      },
      {
        "id": 7,
        "class": "truck",
        "bbox": [520, 180, 720, 450],
        "centroid": [620.0, 315.0]
      }
    ],
    "inference_ms": 22.5
  },
  ...
]
```

**Person B**: Consume directly with:
```python
import json
with open("detections.json") as f:
    frames_data = json.load(f)
for frame_data in frames_data:
    detections = frame_data["detections"]
    for det in detections:
        id, cls, bbox, centroid = det["id"], det["class"], det["bbox"], det["centroid"]
```

---

## Debug Logging

### Quiet Mode (default: `DEBUG_MODE = False`)

Clean one-line summaries every 10 frames:

```
[Frame 10] Vehicles detected: 4 | Avg inference: 23ms
[Frame 20] Vehicles detected: 5 | Avg inference: 24ms
[Frame 30] Vehicles detected: 3 | Avg inference: 22ms
```

### Verbose Mode (`DEBUG_MODE = True`)

Per-frame details:

```
Processing frame 1/450
  Frame 1: 2 vehicles | Inference: 22.3ms
    ID=  0 Class=car        BBox=(154,230,412,398) Centroid=(283,314)
    ID=  1 Class=truck      BBox=(520,180,720,450) Centroid=(620,315)
Processing frame 2/450
  Frame 2: 2 vehicles | Inference: 21.8ms
  ...
```

**To enable**: Edit `config.py`, set `DEBUG_MODE = True`, then run.

### Debug Log File (`debug.log`)

Always captured, regardless of mode. Includes:
- System info at startup
- Every detection per frame (when DEBUG_MODE=True)
- All errors with full traceback
- Pipeline completion summary

```bash
tail -f debug.log  # Watch in real-time
```

---

## Person B Integration

### Consume Real-Time Stream

```python
from detector_tracker import create_tracker

tracker = create_tracker()
for frame_num, detections, frame_with_boxes in tracker.stream_frames("input_video.mp4"):
    # detections = [{"id": 12, "class": "car", "bbox": [...], "centroid": [...]}, ...]
    print(f"Frame {frame_num}: {len(detections)} vehicles")
    # Send to Person B's downstream module
```

### Use Processed JSON

```python
import json

with open("detections.json") as f:
    all_frames = json.load(f)

for frame_data in all_frames:
    frame_num = frame_data["frame"]
    detections = frame_data["detections"]
    inference_ms = frame_data["inference_ms"]
    
    for det in detections:
        print(f"Frame {frame_num}: Vehicle ID={det['id']} Class={det['class']} at {det['centroid']}")
```

---

## Troubleshooting

### **"ROCm not detected" but I have an AMD GPU**

1. **Verify ROCm installation:**
   ```bash
   rocm-smi
   ```
   If this fails, ROCm is not installed. Install it: https://rocmdocs.amd.com/en/latest/

2. **Check PyTorch ROCm version matches your ROCm installation:**
   ```bash
   # Your installed ROCm version
   rocm-smi --version | grep "ROCm"
   
   # Download PyTorch for that version (5.7 or 5.6)
   pip install torch --index-url https://download.pytorch.org/whl/rocm5.7
   ```

3. **Fallback to CPU:**
   ```bash
   pip install torch --index-url https://download.pytorch.org/whl/cpu
   # (Slower but will work)
   ```

### **"Cannot open video: input_video.mp4"**

1. Check file exists:
   ```bash
   ls -la input_video.mp4
   ```

2. Verify it's a valid video:
   ```bash
   ffprobe input_video.mp4  # If you have ffmpeg installed
   ```

3. Try a different video file, or re-download it.

### **Inference is Very Slow (>100ms per frame)**

1. **Check device usage:**
   - If `DEBUG_MODE=True`, look for "Device: CPU" in system info
   - This means it's running on CPU (slow). Install correct PyTorch for your GPU.

2. **Reduce frame resolution:**
   ```python
   # In config.py
   FRAME_RESIZE_WIDTH = 480
   FRAME_RESIZE_HEIGHT = 360
   ```

3. **Use a smaller model:**
   ```python
   # In config.py
   YOLO_MODEL = "yolov8n.pt"  # nano (faster, less accurate)
   # Instead of
   YOLO_MODEL = "yolov8s.pt"  # small (balanced)
   ```

### **"Validation failed: [X] checks failed"**

Run the validation separately to see details:

```bash
python -c "from validator import validate; validate()"
```

Common causes:
- Missing `input_video.mp4` → download a sample video
- Output directory not writable → check file permissions
- PyTorch not installed → run PyTorch install command above

### **ModuleNotFoundError: No module named 'ultralytics'**

```bash
pip install -r requirements.txt
```

### **CUDA Out of Memory**

If using NVIDIA GPU and getting "out of memory" errors:

```python
# In config.py, reduce frame resolution
FRAME_RESIZE_WIDTH = 480
FRAME_RESIZE_HEIGHT = 360
```

Or use CPU:
```bash
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

---

## Performance Expectations

| Device | Resolution | FPS | Inference/Frame |
|--------|------------|-----|-----------------|
| AMD Radeon RX 7900 XT (ROCm) | 640×480 | ~43 | ~23ms |
| CPU (Intel i7-12700K) | 640×480 | ~8 | ~125ms |
| NVIDIA RTX 4090 (CUDA) | 640×480 | ~45 | ~22ms |

Your mileage may vary based on CPU, storage speed, and video codec.

---

## Advanced: Custom Stream Consumer

```python
from detector_tracker import create_tracker
import cv2

tracker = create_tracker()

for frame_num, detections, annotated_frame in tracker.stream_frames("input_video.mp4"):
    # Send detections to downstream service (Person B)
    send_to_person_b(detections)
    
    # Or display in real-time
    cv2.imshow("Traffic Tracking", annotated_frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cv2.destroyAllWindows()
```

---

## API Reference

### `detector_tracker.py`

#### `create_tracker()`
```python
tracker = create_tracker()
```
Factory function. Returns initialized DetectionTracker with model loaded.

#### `tracker.stream_frames(video_path)`
```python
for frame_num, detections, frame_annotated in tracker.stream_frames("video.mp4"):
    # process detections
```
Generator. Yields (frame_number, detections_list, annotated_frame).

#### `tracker.process_video(input_path, output_video, output_json)`
```python
tracker.process_video("input.mp4", "output.mp4", "detections.json")
```
Process entire video, save outputs.

#### Output Format
```python
detections = [
    {
        "id": int,                    # Track ID (-1 if untracked)
        "class": str,                 # "car", "bus", "truck", "motorcycle"
        "bbox": [x1, y1, x2, y2],     # Bounding box (pixels)
        "centroid": [cx, cy]          # Center point (pixels)
    },
    ...
]
```

---

## License & Attribution

- **YOLOv8**: Ultralytics (MIT License)
- **ByteTrack**: Yifu Zhang et al. (MIT License)
- **OpenCV**: Apache 2 License

---

## Support

1. **Check the logs**: `debug.log` and console output
2. **Verify PyTorch installation**: `python -c "import torch; print(torch.__version__)"`
3. **Test with a different video** if the issue is video-specific
4. **Contact**: Provide `debug.log` + error message + PyTorch version when reporting issues

---

**Ready to integrate with Person B!** 🚀
