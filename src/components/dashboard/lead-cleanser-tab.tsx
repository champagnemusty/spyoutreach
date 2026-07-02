"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react";

const CLEANUP_RULES = [
  "Strips legal suffixes — Ltd., Inc., Co., LLC, GmbH, Shti.",
  "Validates email format and flags dead-looking addresses",
  "Verifies social links resolve to a real profile, not a 404",
];

export function LeadCleanserTab({ onCleaned }: { onCleaned: (credits: number) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function acceptFile(candidate: File | undefined) {
    if (!candidate) return;
    const isValid = /\.(csv|json)$/i.test(candidate.name);
    if (!isValid) return;
    setError(null);
    setFile(candidate);
  }

  async function handleClean() {
    if (!file) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/cleanse", { method: "POST", body: formData });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error ?? "Failed to clean list.");
      }

      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      onCleaned(result.credits);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-foreground">Lead Cleanser</h2>
        <p className="mt-1 text-sm text-muted">
          Upload a raw B2B list. We normalize company names and validate contact data.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          acceptFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center transition-colors ${
          isDragging ? "border-accent bg-surface-hover" : "border-border-strong bg-surface"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.json"
          className="hidden"
          onChange={(e) => acceptFile(e.target.files?.[0])}
        />
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-hover">
          <Upload className="h-5 w-5 text-muted" />
        </div>
        <div>
          <p className="text-sm text-foreground">
            Drag & drop your CSV or JSON file here, or click to browse
          </p>
          <p className="mt-1 text-xs text-muted">Max 10,000 rows per batch</p>
        </div>
      </div>

      {file && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-muted" />
            <span className="text-sm text-foreground">{file.name}</span>
            <span className="text-xs text-muted">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-muted transition-colors hover:text-foreground"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="space-y-2 rounded-xl border border-border bg-surface px-4 py-4">
        {CLEANUP_RULES.map((rule) => (
          <div key={rule} className="flex items-start gap-2.5 text-sm text-muted">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{rule}</span>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">Uses 1 credit per batch</p>
        <button
          onClick={handleClean}
          disabled={!file || isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors enabled:hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Cleaning..." : "Clean List"}
        </button>
      </div>
    </div>
  );
}
