import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileVideo, X, CheckCircle2, Sparkles } from "lucide-react";
import { uploadVideo } from "@/lib/mock-api";

export function UploadCard({
  onUploaded,
}: {
  onUploaded: (file: File) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(async (accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setUploading(true);
    setDone(false);
    setProgress(0);
    await uploadVideo(f, setProgress);
    setUploading(false);
    setDone(true);
    onUploaded(f);
  }, [onUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "video/mp4": [".mp4"], "video/x-msvideo": [".avi"] },
  });

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setDone(false);
  };

  return (
    <div className="glass-lg rounded-2xl p-8 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Upload Traffic Video</h2>
            <p className="text-xs text-muted-foreground">
              Formats: <span className="font-mono">.mp4 .avi</span>
            </p>
          </div>
        </div>
        {file && (
          <button
            onClick={reset}
            className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
          >
            <X className="h-4 w-4" /> Clear
          </button>
        )}
      </div>

      {!file ? (
        <div
          {...getRootProps()}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition ${
            isDragActive
              ? "border-[var(--neon-orange)] bg-[var(--neon-orange)]/5"
              : "border-border hover:border-[var(--neon-orange)]/60 hover:bg-[var(--neon-orange)]/5"
          }`}
        >
          <input {...getInputProps()} />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.6 }}
            className="mx-auto h-20 w-20 rounded-2xl gradient-bg flex items-center justify-center neon-glow"
          >
            <Upload className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <p className="mt-6 text-base font-semibold text-foreground">
            {isDragActive ? "✨ Drop the video here…" : "Drag & drop your traffic video here"}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            or click to browse files from your computer
          </p>
          <p className="text-[10px] text-muted-foreground mt-4 font-medium">
            Max file size: 1GB • Recommended: 720p or higher
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl overflow-hidden border border-border bg-black/40 aspect-video relative group">
            {previewUrl && (
              <video src={previewUrl} controls className="h-full w-full object-contain" />
            )}
            {uploading && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-x-0 h-12 gradient-bg opacity-50 blur-md animate-scan" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ 
                background: "color-mix(in oklab, var(--neon-orange) 20%, transparent)",
                color: "var(--neon-orange)",
              }}
            >
              <FileVideo className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <AnimatePresence>
              {done && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-[var(--neon-green)] flex items-center gap-1.5 text-xs font-semibold"
                >
                  <CheckCircle2 className="h-5 w-5" /> Ready
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden border border-border/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full gradient-bg"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{uploading ? "Processing..." : "Upload complete"}</span>
            <span className="font-mono font-semibold text-foreground">{progress}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
