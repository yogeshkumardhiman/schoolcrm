"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Loader2, RotateCw, RotateCcw, Check, X, Crop, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentCropperModalProps {
  imageSrc: string;
  documentTitle?: string;
  onCancel: () => void;
  onCropComplete: (croppedBlob: Blob, previewUrl: string) => void | Promise<void>;
  isProcessing?: boolean;
  initialAspect?: number;
}

const ASPECT_RATIOS = [
  { label: "Passport (3.5:4.5)", value: 3.5 / 4.5 },
  { label: "Free / Auto", value: undefined },
  { label: "ID Card (3:2)", value: 3 / 2 },
  { label: "A4 Doc (3:4)", value: 3 / 4 },
  { label: "Square (1:1)", value: 1 }
];

export const DocumentCropperModal: React.FC<DocumentCropperModalProps> = ({
  imageSrc,
  documentTitle = "Document",
  onCancel,
  onCropComplete,
  isProcessing = false,
  initialAspect
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(initialAspect);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleCropComplete = useCallback((_croppedArea: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      const result = await getRotatedAndCroppedImg(imageSrc, croppedAreaPixels, rotation);
      if (result) {
        await onCropComplete(result.blob, result.dataUrl);
      }
    } catch (err) {
      console.error("Error cropping document image:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Crop size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-heading">
                Crop & Align {documentTitle}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Adjust rotation, zoom, and borders to ensure clear document legibility
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="h-8 w-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cropper Canvas */}
        <div className="relative flex-1 min-h-[360px] sm:min-h-[460px] bg-slate-950 overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            showGrid={true}
          />
        </div>

        {/* Controls Toolbar */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 space-y-4 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Aspect Ratio Selection */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {ASPECT_RATIOS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setAspect(item.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    aspect === item.value
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Rotation Controls */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRotateLeft}
                className="h-9 px-3 rounded-xl border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-bold flex items-center gap-1.5"
                title="Rotate 90° Anti-Clockwise"
              >
                <RotateCcw size={14} /> Rotate -90°
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRotateRight}
                className="h-9 px-3 rounded-xl border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-bold flex items-center gap-1.5"
                title="Rotate 90° Clockwise"
              >
                <RotateCw size={14} /> Rotate +90°
              </Button>
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-3 min-w-[180px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Zoom
              </span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-full cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-indigo-400 w-8 text-right">
                {zoom.toFixed(1)}x
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isProcessing}
              className="h-10 px-5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isProcessing}
              className="h-10 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Check size={15} /> Crop & Attach Document
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🖼️ ROTATE & CROP CANVAS HELPER
async function getRotatedAndCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<{ blob: Blob; dataUrl: string } | null> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (!imageSrc.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const rotRad = (rotation * Math.PI) / 180;
  const { width: bBoxWidth, height: bBoxHeight } = calculateRotatedDimensions(
    image.width,
    image.height,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");
  if (!croppedCtx) return null;

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  const dataUrl = croppedCanvas.toDataURL("image/jpeg", 0.95);

  return new Promise((resolve) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob, dataUrl });
        } else {
          resolve(null);
        }
      },
      "image/jpeg",
      0.95
    );
  });
}

function calculateRotatedDimensions(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height)
  };
}

export default DocumentCropperModal;
