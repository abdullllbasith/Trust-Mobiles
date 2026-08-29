import { useRef, useState } from "react";
import { GripVertical, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { compressImageFile } from "@/lib/compressImage";

type ProductImageManagerProps = {
  images: string[];
  onChange: (images: string[]) => void;
};

export function ProductImageManager({ images, onChange }: ProductImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const addFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    setUploading(true);
    try {
      const compressed = await Promise.all(
        fileArray.map((file) =>
          compressImageFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.8 }),
        ),
      );
      onChange([...images, ...compressed.filter(Boolean)]);
    } catch {
      toast.error("Could not process one or more images");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      void addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const next = [...images];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onChange(next);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Product Images</Label>
        <span className="text-xs text-muted-foreground">
          {images.length} image{images.length === 1 ? "" : "s"}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        {uploading ? "Compressing…" : "Upload Images"}
      </Button>

      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Drag to reorder. The first image is the main product photo.
          </p>
          <div className="grid gap-2 max-h-[280px] overflow-y-auto pr-1">
            {images.map((img, index) => (
              <div
                key={`${index}-${img.slice(0, 32)}`}
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(index);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedIndex !== null) {
                    moveImage(draggedIndex, index);
                  }
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                className={`flex items-center gap-3 rounded-lg border bg-white p-2 transition-colors ${
                  dragOverIndex === index ? "border-[#111] bg-gray-50" : "border-black/10"
                } ${draggedIndex === index ? "opacity-60" : ""}`}
              >
                <button
                  type="button"
                  className="cursor-grab text-gray-400 hover:text-gray-700 active:cursor-grabbing"
                  aria-label="Drag to reorder"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <img
                  src={img}
                  alt={`Product ${index + 1}`}
                  className="h-14 w-14 rounded-md border object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    Image {index + 1}
                    {index === 0 && (
                      <span className="ml-2 text-xs font-normal text-[#C5A059]">Main</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {img.startsWith("data:") ? "Uploaded file" : img}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 shrink-0"
                  onClick={() => removeImage(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>
            Clear All Images
          </Button>
        </div>
      )}
    </div>
  );
}
