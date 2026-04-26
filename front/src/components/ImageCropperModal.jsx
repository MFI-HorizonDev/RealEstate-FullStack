import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, RotateCcw, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Image Cropper Modal Component
 * Allows users to crop and adjust their profile image
 */
export const ImageCropperModal = ({ 
  imageFile, 
  onCropComplete, 
  onCancel,
  isOpen = false 
}) => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [preview, setPreview] = useState(null);
  const [currentFile, setCurrentFile] = useState(imageFile);

  // Sync currentFile with imageFile prop when it changes
  React.useEffect(() => {
    if (imageFile) {
      setCurrentFile(imageFile);
    }
  }, [imageFile]);

  // Load image preview
  React.useEffect(() => {
    if (currentFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(currentFile);
    }
  }, [currentFile]);

  // Draw when preview changes or adjustments change
  React.useEffect(() => {
    if (preview) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas size to square for circular crop
        const size = 400;
        canvas.width = size;
        canvas.height = size;

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Save context state
        ctx.save();

        // Move to center
        ctx.translate(size / 2, size / 2);

        // Rotate
        ctx.rotate((rotation * Math.PI) / 180);

        // Calculate base scale to fit image in canvas at 1.0x zoom
        const baseScale = Math.min(size / img.width, size / img.height);
        
        // Apply transformations: base scale + zoom multiplier
        ctx.scale(baseScale * zoom, baseScale * zoom);
        ctx.translate(position.x, position.y);

        // Draw image centered
        ctx.drawImage(
          img,
          -img.width / 2,
          -img.height / 2,
          img.width,
          img.height
        );

        // Restore context
        ctx.restore();

        // Create circular mask with visible white border
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Add dashed circle for extra visibility
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
      };

      img.src = preview;
    }
  }, [preview, zoom, rotation, position]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = (e.clientX - dragStart.x) / zoom;
    const deltaY = (e.clientY - dragStart.y) / zoom;

    setPosition({
      x: position.x + deltaX * 0.5,
      y: position.y + deltaY * 0.5,
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCropComplete = () => {
    if (canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        onCropComplete(blob);
      }, 'image/jpeg', 0.95);
    }
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Please upload a valid image file (JPG, PNG, GIF, or WebP)',
          duration: 3000,
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'Image size must be less than 5MB',
          duration: 3000,
        });
        return;
      }

      // Update file and reset adjustments
      setCurrentFile(file);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });

      // Clear the input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isOpen || !preview) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>Crop & Adjust Profile Picture</CardTitle>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Preview Canvas */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">
              Drag to reposition • Scroll to zoom • Use slider to adjust
            </p>
            <div
              className="bg-gray-100 rounded-lg overflow-hidden cursor-move relative"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas
                ref={canvasRef}
                className="w-full max-h-96 object-contain mx-auto display-block"
                style={{ touchAction: 'none' }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Zoom Control */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <ZoomIn className="w-4 h-4 text-gray-600" />
                <label className="text-sm font-semibold text-gray-700">
                  Zoom: {zoom.toFixed(2)}x
                </label>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Rotation Control */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <RotateCcw className="w-4 h-4 text-gray-600" />
                <label className="text-sm font-semibold text-gray-700">
                  Rotation: {rotation}°
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Info Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                💡 <strong>Tip:</strong> The white circle shows where your image will be cropped. Adjust until you're happy with how you look!
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleChangeImage}
              className="flex-1"
            >
              <ImagePlus className="w-4 h-4 mr-2" />
              Change Image
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCropComplete}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Crop & Upload
            </Button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.webp,image/jpeg,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageCropperModal;
