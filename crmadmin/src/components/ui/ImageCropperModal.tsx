import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import { Loader2 } from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  onCancel: () => void;
  onCropComplete: (croppedBlob: Blob) => void | Promise<void>;
  isUploading?: boolean;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageSrc,
  onCancel,
  onCropComplete,
  isUploading = false,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCommit = async () => {
    if (!croppedAreaPixels) return;
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (blob) {
        await onCropComplete(blob as Blob);
      }
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500 p-10">
      <div className="relative w-full max-w-2xl h-[400px] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-black">
        <Cropper 
          image={imageSrc} 
          crop={crop} 
          zoom={zoom} 
          aspect={1} 
          onCropChange={setCrop} 
          onCropComplete={handleCropComplete} 
          onZoomChange={setZoom} 
        />
      </div>
      <div className="mt-10 w-full max-w-sm space-y-6 text-center">
        <input 
          type="range" 
          min={1} 
          max={3} 
          step={0.1} 
          value={zoom} 
          onChange={(e: any) => setZoom(e.target.value)} 
          className="w-full accent-blue-500 h-1 bg-white/10 rounded-full" 
        />
        <div className="flex gap-4">
          <button 
            onClick={onCancel} 
            disabled={isUploading}
            className="flex-1 h-14 rounded-lgl border border-white/10 text-white/40 text-[10px] font-bold tracking-[5px] hover:bg-white/5 transition-all disabled:opacity-50"
          >
            Discard
          </button>
          <button 
            onClick={handleCommit} 
            disabled={isUploading} 
            className="flex-1 h-14 rounded-lgl bg-blue-600 text-white text-[10px] font-bold tracking-[5px] shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? <Loader2 className="animate-spin" /> : 'Commit Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 🖼️ IMAGE PROCESSING UTILITY
async function getCroppedImg(imageSrc: string, pixelCrop: any) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg'));
}

export default ImageCropperModal;
