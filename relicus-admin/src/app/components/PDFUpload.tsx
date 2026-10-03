import React, { useState, useRef } from 'react';
import { FileText, Upload, X, Loader2, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { uploadFileToCloudinary, formatFileSize } from '../services/cloudinaryService';

interface PDFUploadProps {
  value: string;
  onChange: (url: string, fileInfo?: { name: string; size: string; bytes: number }) => void;
  label?: string;
  className?: string;
  maxSizeMB?: number;
  currentSizeDisplay?: string;
}

export function PDFUpload({
  value,
  onChange,
  label,
  className = '',
  maxSizeMB = 2,
  currentSizeDisplay,
}: PDFUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxBytes = maxSizeMB * 1024 * 1024;

  const processFile = async (file: File) => {
    // 1. Validate PDF extension or MIME type
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      setError('Invalid file type. Please upload a valid PDF document (.pdf).');
      return;
    }

    // 2. Strict Size Restriction (< 2 MB)
    if (file.size > maxBytes) {
      const actualSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(
        `File size exceeds the ${maxSizeMB} MB restriction. Your file is ${actualSizeMB} MB. Please upload a PDF below ${maxSizeMB} MB.`
      );
      return;
    }

    setIsUploading(true);
    setUploadPercent(0);
    setError(null);

    try {
      // 3. Upload directly to Cloudinary (Zero Supabase free tier storage used)
      const result = await uploadFileToCloudinary(file, {
        folder: 'relicus/notes',
        resourceType: 'auto',
        onProgress: (percent) => setUploadPercent(percent),
      });

      const formattedSize = formatFileSize(result.bytes || file.size);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');

      onChange(result.secureUrl, {
        name: cleanName,
        size: formattedSize,
        bytes: result.bytes || file.size,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to upload PDF to Cloudinary. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadPercent(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset file input so selecting the same file again triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const getDisplayFilename = (url: string) => {
    if (!url) return 'Uploaded Document.pdf';
    try {
      const parts = url.split('/');
      const last = parts[parts.length - 1];
      return decodeURIComponent(last).split('?')[0];
    } catch {
      return 'Uploaded Document.pdf';
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
            Max limit: {maxSizeMB} MB
          </span>
        </div>
      )}

      {value ? (
        /* Uploaded State Card */
        <div className="p-2.5 bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800/60 rounded-xl shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {getDisplayFilename(value)}
                  </p>
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentSizeDisplay && (
                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-mono text-[9px] text-slate-600 dark:text-slate-300">
                      {currentSizeDisplay}
                    </span>
                  )}
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[9px]">
                    Cloudinary CDN Ready
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-teal-700 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
                title="Preview PDF in new browser tab"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Test PDF</span>
              </a>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-2 py-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Replace with another PDF"
              >
                Replace
              </button>

              <button
                type="button"
                onClick={() => onChange('')}
                disabled={isUploading}
                className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                title="Remove attached PDF"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Drag & Drop Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:border-slate-400'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
              <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Uploading to Cloudinary CDN... {uploadPercent > 0 ? `${uploadPercent}%` : ''}
              </p>
              <p className="text-[9px] text-slate-400">Optimizing PDF for fast mobile viewing</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 py-1.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                  <span className="text-teal-600 hover:underline">Click to upload PDF</span> or drag & drop
                </p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500">
                  PDF documents only • <strong className="text-amber-600 dark:text-amber-400 font-semibold">Strictly under {maxSizeMB} MB</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-1.5 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-700 dark:text-rose-400 text-[10px]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span className="flex-1 font-medium">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
