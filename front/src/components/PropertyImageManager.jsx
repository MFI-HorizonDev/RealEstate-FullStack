import React, { useRef, useState } from "react";
import { useUploadPropertyImages, useDeletePropertyImage } from "@/hooks/api/properties/UseProperties";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2, Star, Upload, X } from "lucide-react";
import { notify } from "@/lib/notifications";

/**
 * PropertyImageManager
 *
 * Two modes:
 *  - mode="preview"  → used on PropertyCreate: picks files locally, shows previews,
 *                      uploads after the property is saved (call uploadAll(propertyId))
 *  - mode="manage"   → used on PropertyDetails: shows existing images, lets owner
 *                      delete them or add new ones immediately via the API
 *
 * Props:
 *  mode          "preview" | "manage"
 *  propertyId    number  (required for mode="manage", and for uploadAll in mode="preview")
 *  existingImages array of { id, image, is_primary }  (mode="manage")
 *  onFilesChange (files) => void  (mode="preview", optional callback)
 *  ref           forwarded ref exposing { uploadAll(propertyId) } for mode="preview"
 */
const PropertyImageManager = React.forwardRef(function PropertyImageManager(
  { mode = "preview", propertyId, existingImages = [], onFilesChange, canManage = true },
  ref
) {
  const { isAdmin, isAgent, isOwner } = useAuth();
  const canManageImages = canManage && (isAdmin || isAgent || isOwner);
  const fileInputRef = useRef(null);
  const [localFiles, setLocalFiles] = useState([]); // { file, previewUrl }
  const [uploading, setUploading] = useState(false);

  const uploadMutation = useUploadPropertyImages();
  const deleteMutation = useDeletePropertyImage();

  const getApiErrorMessage = (err, fallback = "Request failed.") => {
    const data = err?.data;
    if (typeof data?.detail === "string" && data.detail.trim()) return data.detail;
    if (Array.isArray(data?.image) && data.image[0]) return data.image[0];
    if (typeof err?.message === "string" && err.message.trim()) return err.message;
    return fallback;
  };

  // ── Expose uploadAll for parent (PropertyCreate) ──────────────────────────
  React.useImperativeHandle(ref, () => ({
    async uploadAll(pid) {
      if (!localFiles.length) return;
      setUploading(true);
      try {
        await uploadMutation.mutateAsync({
          propertyId: pid,
          images: localFiles.map(f => f.file),
        });
        notify.success(`${localFiles.length} image(s) uploaded.`);
        setLocalFiles([]);
      } catch (err) {
        notify.error(getApiErrorMessage(err, "Some images failed to upload."));
      } finally {
        setUploading(false);
      }
    },
  }));

  // ── File picker ───────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/webp"];
    const allowedExtensions = [".jpg", ".jpeg", ".webp"];
    const valid = picked.filter(f => {
      if (f.size > 10 * 1024 * 1024) { notify.error(`${f.name} exceeds 10 MB.`); return false; }
      const extension = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
      if (!allowedExtensions.includes(extension) || !allowedMimeTypes.includes(f.type)) {
        notify.error(`${f.name} must be JPG, JPEG, or WebP.`);
        return false;
      }
      return true;
    });

    if (mode === "preview") {
      const newEntries = valid.map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }));
      const updated = [...localFiles, ...newEntries];
      setLocalFiles(updated);
      onFilesChange?.(updated.map(e => e.file));
    } else {
      // mode="manage" → upload immediately
      setUploading(true);
      uploadMutation.mutate(
        { propertyId, images: valid },
        {
          onSuccess: () => notify.success(`${valid.length} image(s) uploaded.`),
          onError: (err) => notify.error(getApiErrorMessage(err, "Upload failed.")),
          onSettled: () => setUploading(false),
        }
      );
    }

    // reset input so same file can be re-selected
    e.target.value = "";
  };

  // ── Remove local preview (mode="preview") ────────────────────────────────
  const removeLocal = (idx) => {
    URL.revokeObjectURL(localFiles[idx].previewUrl);
    const updated = localFiles.filter((_, i) => i !== idx);
    setLocalFiles(updated);
    onFilesChange?.(updated.map(e => e.file));
  };

  // ── Delete existing image (mode="manage") ────────────────────────────────
  const deleteExisting = (imageId, imageName) => {
    if (!canManageImages) return;
    if (!confirm(`Delete this image?`)) return;
    deleteMutation.mutate(imageId, {
      onSuccess: () => notify.success("Image deleted."),
      onError: () => notify.error("Failed to delete image."),
    });
  };

  const isWorking = uploading || uploadMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-4">
      {/* ── Existing images (manage mode) ── */}
      {mode === "manage" && existingImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {existingImages.map((img, idx) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden border border-border bg-muted/30 aspect-video">
              <img src={img.image} alt={`Property image ${idx + 1}`} className="w-full h-full object-cover" />
              {img.is_primary && (
                <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-2.5 h-2.5" /> Primary
                </div>
              )}
              {canManageImages && (
                <button
                  type="button"
                  onClick={() => deleteExisting(img.id)}
                  disabled={isWorking}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Local previews (preview mode) ── */}
      {mode === "preview" && localFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {localFiles.map((entry, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden border border-border bg-muted/30 aspect-video">
              <img src={entry.previewUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              {idx === 0 && (
                <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-2.5 h-2.5" /> Primary
                </div>
              )}
              <button
                type="button"
                onClick={() => removeLocal(idx)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {mode === "manage" && existingImages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-xl bg-muted/30 text-muted-foreground">
          <ImagePlus className="w-10 h-10 mb-2" />
          <p className="text-sm font-medium">No images yet</p>
          <p className="text-xs">Upload photos to showcase your property</p>
        </div>
      )}

      {canManageImages && mode === "preview" && localFiles.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30 text-blue-700 cursor-pointer hover:bg-blue-50 transition-colors"
        >
          <ImagePlus className="w-10 h-10 mb-2 text-blue-400" />
          <p className="text-sm font-semibold">Click to add photos</p>
          <p className="text-xs text-blue-400 mt-1">JPG, JPEG, WebP · max 10 MB each · first image = primary</p>
        </div>
      )}

      {/* ── Add more button ── */}
      {canManageImages && (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isWorking}
            className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
          >
            {isWorking ? (
              <><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="w-4 h-4" /> {mode === "preview" ? "Add Photos" : "Upload More"}</>
            )}
          </Button>
          {mode === "preview" && localFiles.length > 0 && (
            <p className="text-xs text-muted-foreground">{localFiles.length} photo{localFiles.length !== 1 ? "s" : ""} selected · will upload after saving</p>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.webp,image/jpeg,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
});

export default PropertyImageManager;
