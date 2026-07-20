import React, { useRef, useState, useEffect } from 'react';
import { Camera, Circle, RotateCcw, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  className?: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsStreaming(true);
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg', lastModified: Date.now() });
        setCapturedImage(URL.createObjectURL(blob));
        stopCamera();
        onCapture(file);
      },
      'image/jpeg',
      0.9,
    );
  };

  const retakePhoto = () => {
    if (capturedImage) URL.revokeObjectURL(capturedImage);
    setCapturedImage(null);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    if (capturedImage) URL.revokeObjectURL(capturedImage);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm ${className}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="panel w-full max-w-md p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-700 text-content">Capture Photo</h3>
          <button onClick={handleClose} className="rounded-lg p-2 text-content-muted transition-colors hover:bg-surface-hover hover:text-content" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {error ? (
          <div className="py-8 text-center">
            <Camera size={44} className="mx-auto mb-3 text-danger" />
            <p className="mb-5 text-sm text-danger-soft">{error}</p>
            <button onClick={startCamera} className="btn btn-primary mx-auto">
              Try Again
            </button>
          </div>
        ) : capturedImage ? (
          <div className="text-center">
            <img src={capturedImage} alt="Captured" className="mb-5 w-full rounded-xl border border-line" />
            <div className="flex justify-center gap-3">
              <button onClick={retakePhoto} className="btn btn-ghost">
                <RotateCcw size={16} />
                Retake
              </button>
              <button onClick={handleClose} className="btn btn-primary">
                Use Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="relative mb-5 overflow-hidden rounded-xl border border-line">
              <video ref={videoRef} className="w-full" playsInline muted />
              {/* Framing guide + scan line */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-40 w-32 -translate-x-1/2 -translate-y-1/2 rounded-[45%] border-2 border-accent/50" />
                {isStreaming && (
                  <div className="absolute inset-x-0 top-0 h-1/2 animate-scan bg-gradient-to-b from-accent/20 to-transparent" />
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {isStreaming ? (
              <button onClick={capturePhoto} className="btn btn-primary mx-auto">
                <Circle size={18} />
                Capture
              </button>
            ) : (
              <div className="py-2 font-mono text-sm text-content-faint">Initializing camera…</div>
            )}
          </div>
        )}

        <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-wider text-content-faint">
          Center your face in the frame
        </p>
      </div>
    </div>
  );
};

export default CameraCapture;
