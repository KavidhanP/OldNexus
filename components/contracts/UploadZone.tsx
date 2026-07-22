"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  file: File;
  status: "queued" | "uploading" | "done" | "error";
  progress: number;
}

interface UploadZoneProps {
  onUploadSuccess?: (extractedData: any) => void;
  maxFiles?: number;
}

export default function UploadZone({ onUploadSuccess, maxFiles = 10 }: UploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const newFiles: UploadedFile[] = accepted.map((f) => ({
        id: `${f.name}-${Date.now()}`,
        file: f,
        status: "queued",
        progress: 0,
      }));
      setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles));

      // Actual Upload
      newFiles.forEach(async (uf) => {
        setFiles((prev) =>
          prev.map((f) => (f.id === uf.id ? { ...f, status: "uploading", progress: 20 } : f))
        );

        const formData = new FormData();
        formData.append("file", uf.file);

        try {
          // Fake progress for UI feel while Gemini processes
          const interval = setInterval(() => {
            setFiles((prev) =>
              prev.map((f) => {
                if (f.id !== uf.id || f.status !== "uploading") return f;
                const newProgress = Math.min(f.progress + 5, 90); // Cap at 90% until done
                return { ...f, progress: newProgress };
              })
            );
          }, 500);

          const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          const res = await fetch(`${API}/contracts/extract`, {
            method: "POST",
            body: formData,
          });

          clearInterval(interval);

          if (!res.ok) {
            const errorBody = await res.text();
            console.error("Backend error:", res.status, errorBody);
            throw new Error(`Upload failed (${res.status}): ${errorBody}`);
          }
          
          const result = await res.json();
          
          setFiles((prev) =>
            prev.map((f) => (f.id === uf.id ? { ...f, status: "done", progress: 100 } : f))
          );

          if (onUploadSuccess && result.data) {
            onUploadSuccess(result.data);
          }

        } catch (error) {
          console.error("Upload error:", error);
          setFiles((prev) =>
            prev.map((f) => (f.id === uf.id ? { ...f, status: "error" } : f))
          );
        }
      });
    },
    [maxFiles, onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn("drop-zone", isDragActive && "drag-active")}
      >
        <input {...getInputProps()} />
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: isDragActive ? "rgba(107,11,12,0.12)" : "rgba(107,11,12,0.06)" }}
        >
          <Upload
            className={cn(
              "w-7 h-7 transition-colors",
              isDragActive ? "text-burgundy-900" : "text-frost-600"
            )}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">
            {isDragActive ? "Drop PDFs here..." : "Drag & drop insurance contracts"}
          </p>
          <p className="text-xs text-frost-600 mt-1">
            PDF files only · 2018–2026 vintage · Max {maxFiles} files
          </p>
        </div>
        <button className="btn-primary text-sm">Browse Files</button>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uf) => (
            <div key={uf.id} className="card p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{uf.file.name}</p>
                <div className="mt-1.5 h-1 bg-frost-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${uf.progress}%`,
                      background:
                        uf.status === "error"
                          ? "#dc2626"
                          : "linear-gradient(90deg, #6b0b0c, #c02d3a)",
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {uf.status === "uploading" && (
                  <Loader2 className="w-4 h-4 text-burgundy-900 animate-spin" />
                )}
                {uf.status === "done" && (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                )}
                <button
                  onClick={() => removeFile(uf.id)}
                  className="text-frost-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
