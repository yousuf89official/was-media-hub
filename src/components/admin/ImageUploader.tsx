import { useState, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateImageFile } from "@/utils/imageHelpers";
import { useUploadImage } from "@/hooks/useSiteImages";

interface ImageUploaderProps {
  name: string;
  usageLocation?: string;
  onSuccess?: () => void;
}

export const ImageUploader = ({ name, usageLocation, onSuccess }: ImageUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const uploadMutation = useUploadImage();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!file) return;

    uploadMutation.mutate(
      { file, name, altText, usageLocation },
      {
        onSuccess: () => {
          setFile(null);
          setPreview(null);
          setAltText("");
          onSuccess?.();
        },
      }
    );
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop an image, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, SVG, WebP (max 2MB)
              </p>
            </div>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
              onChange={handleChange}
              className="max-w-xs mx-auto"
            />
          </div>
        )}
      </div>

      {file && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="altText">Alt Text (for accessibility)</Label>
            <Input
              id="altText"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image"
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="w-full"
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
      )}
    </div>
  );
};
