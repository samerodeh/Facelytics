import React, { useEffect, useRef, useState } from 'react';
import { Upload, X, Camera, ImageIcon } from 'lucide-react';
import CameraCapture from './CameraCapture';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = 'image/*',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleFileSelect(e.target.files[0]);
  };

  const clearFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`group relative overflow-hidden rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? 'border-accent bg-accent-glow' : 'border-line hover:border-accent/50 hover:bg-surface-hover/40'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={handleDrop}
        onClick={(e) => {
          if (e.target === e.currentTarget) fileInputRef.current?.click();
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center gap-3">
            {preview ? (
              <img
                src={preview}
                alt="Selected preview"
                className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover"
              />
            ) : (
              <ImageIcon size={24} className="text-accent" />
            )}
            <span className="min-w-0 flex-1 truncate text-left font-mono text-sm text-content-muted">
              {selectedFile.name}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="rounded-lg p-2 text-danger transition-colors hover:bg-danger-bg"
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-line bg-ink/60 text-content-muted transition-colors group-hover:text-accent">
              <Upload size={22} />
            </span>
            <p className="text-sm text-content-muted">Drag &amp; drop an image, or</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="btn btn-primary px-4 py-2 text-sm"
              >
                <Upload size={16} />
                Choose File
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCamera(true);
                }}
                className="btn btn-ghost px-4 py-2 text-sm"
              >
                <Camera size={16} />
                Take Photo
              </button>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-content-faint">
              JPG · PNG · WEBP
            </p>
          </div>
        )}
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={(file) => {
            handleFileSelect(file);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default FileUpload;
