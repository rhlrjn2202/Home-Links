"use client";

import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useController, UseControllerProps } from 'react-hook-form';
import { XCircle, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormDescription, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PropertyImageUploadProps extends UseControllerProps<any> {
  maxFiles?: number;
}

export function PropertyImageUpload({ name, control, maxFiles = 5 }: PropertyImageUploadProps) {
  const {
    field: { onChange, value: files },
    fieldState: { error },
  } = useController({ name, control });

  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    // Generate previews for existing files (if any, e.g., on form reset)
    const newPreviews = (files || []).map((file: File) => URL.createObjectURL(file));
    setPreviews(newPreviews);

    return () => {
      // Clean up object URLs when component unmounts or files change
      newPreviews.forEach(URL.revokeObjectURL);
    };
  }, [files]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const currentFiles = files || [];
    const newFiles = acceptedFiles.slice(0, maxFiles - currentFiles.length);

    if (newFiles.length === 0 && acceptedFiles.length > 0) {
      toast.warning(`You can only upload a maximum of ${maxFiles} images.`);
      return;
    }

    if (currentFiles.length + newFiles.length > maxFiles) {
      toast.warning(`You can only upload a maximum of ${maxFiles} images.`);
    }

    const updatedFiles = [...currentFiles, ...newFiles].slice(0, maxFiles);
    onChange(updatedFiles);
  }, [files, maxFiles, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: maxFiles,
    multiple: true,
  });

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedFiles = (files || []).filter((_: File, index: number) => index !== indexToRemove);
    onChange(updatedFiles);
  };

  return (
    <div className="space-y-2">
      <FormLabel>Property Images ({previews.length}/{maxFiles})</FormLabel>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer",
          "transition-colors duration-200",
          isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-gray-400 bg-gray-50",
          error && "border-destructive"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
        {isDragActive ? (
          <p className="text-sm text-muted-foreground">Drop the images here ...</p>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Drag 'n' drop up to {maxFiles} images here, or click to select files
          </p>
        )}
        <FormDescription className="mt-2 text-center">
          (JPEG, PNG, WEBP up to 5MB each)
        </FormDescription>
      </div>
      {error && <FormMessage>{error.message}</FormMessage>}

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative w-full h-24 rounded-md overflow-hidden border border-gray-200">
              <img src={preview} alt={`Property image ${index + 1}`} className="w-full h-full object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering dropzone
                  handleRemoveImage(index);
                }}
              >
                <XCircle className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}