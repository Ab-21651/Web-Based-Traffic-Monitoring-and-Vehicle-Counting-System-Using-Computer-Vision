// Real API connection to FastAPI backend.
export type DetectionResult = {
  totalVehicles: number;
  cars: number;
  bikes: number;
  trucks: number;
  buses: number;
  incoming: number;
  outgoing: number;
  peakTime: string;
  density: string;
  detections: {
    id: number;
    type: "Car" | "Bike" | "Truck" | "Bus";
    confidence: number;
    track: number;
    direction: "IN" | "OUT";
    timestamp: string;
  }[];
  timeSeries: { t: string; count: number }[];
  congestion: { t: string; level: number }[];
};

const API_BASE = "http://localhost:8000/api";

export async function uploadVideo(
  file: File,
  onProgress?: (p: number) => void,
): Promise<{ id: string; name: string; size: number }> {
  const formData = new FormData();
  formData.append("file", file);

  // We use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress?.(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

export async function runDetection(
  videoId: string,
  onStage?: (stage: string, progress: number) => void,
): Promise<void> {
  // Start processing
  await fetch(`${API_BASE}/process/${videoId}`, { method: "POST" });

  // Poll for status
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status/${videoId}`);
        const data = await res.json();

        onStage?.(data.stage, data.progress);

        if (data.status === "completed") {
          clearInterval(interval);
          resolve();
        } else if (data.status === "error") {
          clearInterval(interval);
          reject(new Error(data.stage));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, 1000);
  });
}

export async function fetchResults(): Promise<DetectionResult> {
  // Since we only use one video session in this project, we hardcode 'current'
  const res = await fetch(`${API_BASE}/results/current`);
  if (!res.ok) throw new Error("Failed to fetch results");
  return await res.json();
}
