import { useEffect, useRef, useState } from "react";
import { X, Camera, CircleDot, Square, RotateCcw, Smile, Type, Sparkles } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (blob: Blob, type: "image" | "video") => void;
  onClose: () => void;
}

interface Filter {
  id: string;
  name: string;
  emoji?: string;
  cssFilter: string;
}

const filters: Filter[] = [
  { id: "normal", name: "Normal", emoji: "😊", cssFilter: "none" },
  { id: "vivid", name: "Vivid", emoji: "🐶", cssFilter: "saturate(1.8) contrast(1.2) brightness(1.1)" },
  { id: "vintage", name: "Vintage", emoji: "🐱", cssFilter: "sepia(0.5) contrast(1.2) brightness(1.1)" },
  { id: "cool", name: "Cool", emoji: "😘", cssFilter: "saturate(1.3) hue-rotate(180deg)" },
  { id: "warm", name: "Warm", emoji: "😍", cssFilter: "saturate(1.4) contrast(1.1) brightness(1.05) hue-rotate(-15deg)" },
  { id: "bw", name: "B&W", emoji: "😎", cssFilter: "grayscale(1) contrast(1.1)" },
  { id: "dramatic", name: "Dramatic", emoji: "🤩", cssFilter: "contrast(1.5) brightness(0.9) saturate(0.8)" },
  { id: "sunset", name: "Sunset", emoji: "😜", cssFilter: "saturate(1.3) contrast(1.1) brightness(1.05) hue-rotate(-20deg) sepia(0.2)" },
  { id: "frost", name: "Frost", emoji: "🥶", cssFilter: "brightness(1.15) saturate(0.8) hue-rotate(200deg)" },
];

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [captureMode, setCaptureMode] = useState<"photo" | "video">("photo");
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<Filter>(filters[0]);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [permissionRequested, setPermissionRequested] = useState(true);
  const [demoMode, setDemoMode] = useState(true);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textOverlay, setTextOverlay] = useState("");
  const [textColor, setTextColor] = useState("#FFFFFF");

  useEffect(() => {
    if (permissionRequested && !demoMode) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [facingMode, permissionRequested, demoMode]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: captureMode === "video",
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera access was denied. Please allow camera permissions in your browser settings and refresh the page.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found. Please connect a camera and try again.");
      } else {
        setError("Unable to access camera. " + (err.message || "Please check your browser permissions."));
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const capturePhoto = () => {
    if (demoMode) {
      // Create a demo image in demo mode
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Create a gradient background
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, "#667eea");
          gradient.addColorStop(1, "#764ba2");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Apply filter
          ctx.filter = selectedFilter.cssFilter;

          // Add text overlay if exists
          if (textOverlay) {
            ctx.filter = "none";
            ctx.fillStyle = textColor;
            ctx.font = "bold 80px sans-serif";
            ctx.textAlign = "center";
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            // Word wrap
            const maxWidth = canvas.width * 0.9;
            const words = textOverlay.split(" ");
            let line = "";
            let y = canvas.height / 2;
            const lineHeight = 100;

            ctx.fillText(textOverlay, canvas.width / 2, y);
          }

          canvas.toBlob((blob) => {
            if (blob) {
              onCapture(blob, "image");
              stopCamera();
              onClose();
            }
          }, "image/jpeg", 0.95);
        }
      }
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.filter = selectedFilter.cssFilter;
        ctx.drawImage(videoRef.current, 0, 0);

        // Add text overlay if exists
        if (textOverlay) {
          ctx.filter = "none";
          ctx.fillStyle = textColor;
          ctx.font = "bold 60px sans-serif";
          ctx.textAlign = "center";
          ctx.shadowColor = "rgba(0,0,0,0.5)";
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.fillText(textOverlay, canvas.width / 2, canvas.height / 2);
        }

        canvas.toBlob((blob) => {
          if (blob) {
            onCapture(blob, "image");
            stopCamera();
            onClose();
          }
        }, "image/jpeg", 0.95);
      }
    }
  };

  const startRecording = () => {
    if (streamRef.current) {
      chunksRef.current = [];
      
      const options = { mimeType: "video/webm;codecs=vp8,opus" };
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        onCapture(blob, "video");
        stopCamera();
        onClose();
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCapture = () => {
    if (captureMode === "photo") {
      capturePhoto();
    } else {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  const switchMode = async (mode: "photo" | "video") => {
    setCaptureMode(mode);
    if (mode === "video" && streamRef.current) {
      stopCamera();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera with audio:", err);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header - minimalist */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors"
          aria-label="Close camera"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={toggleCamera}
          className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors"
        >
          <RotateCcw className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Camera Preview - Full screen */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="w-full h-full flex items-center justify-center text-white text-center px-6">
            <div>
              <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg mb-1.5 font-medium">Camera Access Denied</p>
              <p className="text-xs opacity-75 mb-4 line-clamp-2">
                Camera permissions are blocked in this environment. You can use Demo Mode to test the interface.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    setDemoMode(true);
                    setError(null);
                    setPermissionRequested(true);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm font-medium transition-colors"
                >
                  Use Demo Mode
                </button>
                <button
                  onClick={() => {
                    setPermissionRequested(false);
                    setError(null);
                  }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : demoMode ? (
          <div className="w-full h-full relative" style={{ filter: selectedFilter.cssFilter }}>
            <div className="w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600" />
            {textOverlay && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p
                  className="text-3xl font-bold text-center px-4 break-words max-w-[90%]"
                  style={{
                    color: textColor,
                    textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                    wordWrap: 'break-word'
                  }}
                >
                  {textOverlay}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ filter: selectedFilter.cssFilter }}
            />
            {textOverlay && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p
                  className="text-3xl font-bold text-center px-4 break-words max-w-[90%]"
                  style={{
                    color: textColor,
                    textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                    wordWrap: 'break-word'
                  }}
                >
                  {textOverlay}
                </p>
              </div>
            )}
          </div>
        )}

        {isRecording && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium">
            <CircleDot className="w-3 h-3 animate-pulse" />
            Recording
          </div>
        )}

        {demoMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-purple-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium">
            Demo Mode
          </div>
        )}

        {/* Right side tools */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-4">
          <button
            onClick={() => setShowTextInput(true)}
            className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors"
          >
            <Type className="w-5 h-5 text-white" />
          </button>
          <button className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors">
            <Smile className="w-5 h-5 text-white" />
          </button>
          <button className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors">
            <Sparkles className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Text Input Modal */}
      {showTextInput && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-zinc-900 rounded-2xl p-6">
            <h3 className="text-white text-lg font-semibold mb-4">Add Text</h3>
            <input
              type="text"
              value={textOverlay}
              onChange={(e) => setTextOverlay(e.target.value)}
              placeholder="Enter your text..."
              className="w-full px-4 py-3 bg-zinc-800 text-white rounded-xl mb-4 outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <div className="mb-4">
              <label className="text-white text-sm mb-2 block">Text Color</label>
              <div className="flex gap-2">
                {["#FFFFFF", "#000000", "#FF6B6B", "#4ECDC4", "#FFD93D", "#A78BFA"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setTextColor(color)}
                    className={`w-10 h-10 rounded-full transition-all ${
                      textColor === color ? "ring-2 ring-white scale-110" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTextInput(false)}
                className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowTextInput(false)}
                className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="pb-safe pb-6 pt-4 px-4">
        {/* Filters - Horizontal scroll above capture button */}
        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex justify-center gap-3 pb-2 px-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter)}
                className="relative flex-shrink-0"
              >
                {/* Ring around selected filter */}
                {selectedFilter.id === filter.id && (
                  <div className="absolute -inset-1 rounded-full border-4 border-white" />
                )}
                {/* Filter circle with emoji/preview */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all bg-white overflow-hidden ${
                    selectedFilter.id === filter.id ? "" : "opacity-70"
                  }`}
                  style={{ filter: filter.cssFilter }}
                >
                  {filter.emoji || "📷"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Capture Button */}
        <div className="flex items-center justify-center gap-8">
          {/* Mode Switcher Left */}
          <button
            onClick={() => switchMode("photo")}
            className={`text-sm font-semibold transition-colors ${
              captureMode === "photo" ? "text-white" : "text-white/50"
            }`}
          >
            PHOTO
          </button>

          {/* Capture Button Center */}
          {(!error || demoMode) && permissionRequested && (
            <button
              onClick={handleCapture}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 transition-all relative"
              aria-label={captureMode === "photo" ? "Take photo" : isRecording ? "Stop recording" : "Start recording"}
            >
              {captureMode === "photo" ? (
                <div className="w-16 h-16 bg-white rounded-full" />
              ) : isRecording ? (
                <Square className="w-8 h-8 text-red-500 fill-red-500" />
              ) : (
                <CircleDot className="w-16 h-16 text-red-500 fill-red-500" />
              )}
            </button>
          )}

          {/* Mode Switcher Right */}
          <button
            onClick={() => switchMode("video")}
            className={`text-sm font-semibold transition-colors ${
              captureMode === "video" ? "text-white" : "text-white/50"
            }`}
          >
            VIDEO
          </button>
        </div>
      </div>
    </div>
  );
}