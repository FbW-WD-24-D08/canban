import { cn } from "@/lib/utils";
import { AlertCircle, Archive, Check, File, FileText, Image, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface FileUploadItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  preview?: string;
  error?: string | undefined;
}

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  onFileUploaded?: (file: FileUploadItem) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
}

// Get file type icon
function getFileIcon(type: string, size: "sm" | "md" | "lg" = "md") {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };
  
  const iconClass = sizeClasses[size];
  
  if (type.startsWith("image/")) {
    return <Image className={`${iconClass} text-blue-500`} />;
  } else if (type.includes("pdf")) {
    return <FileText className={`${iconClass} text-red-500`} />;
  } else if (type.includes("zip") || type.includes("rar")) {
    return <Archive className={`${iconClass} text-yellow-500`} />;
  } else if (type.includes("text") || type.includes("markdown")) {
    return <FileText className={`${iconClass} text-green-500`} />;
  } else {
    return <File className={`${iconClass} text-zinc-500`} />;
  }
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Validate file
function validateFile(file: File, acceptedTypes?: string[], maxFileSize?: number): string | null {
  if (acceptedTypes && acceptedTypes.length > 0) {
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
    
    if (!isValidType) {
      return `File type ${file.type} is not supported`;
    }
  }
  
  if (maxFileSize && file.size > maxFileSize * 1024 * 1024) {
    return `File size exceeds ${maxFileSize}MB limit`;
  }
  
  return null;
}

export function FileUploadZone({
  onFilesSelected,
  onFileUploaded,
  acceptedTypes = [],
  maxFileSize = 10,
  maxFiles = 5,
  className = "",
  disabled = false,
  showPreview = true
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadItems, setUploadItems] = useState<FileUploadItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFiles = useCallback(async (files: File[]) => {
    if (disabled) return;
    
    const validFiles: File[] = [];
    const newUploadItems: FileUploadItem[] = [];
    
    for (const file of Array.from(files).slice(0, maxFiles)) {
      const error = validateFile(file, acceptedTypes, maxFileSize);
      
      const uploadItem: FileUploadItem = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: error ? "error" : "pending",
        error: error || undefined,
      };
      
      // Generate preview for images
      if (file.type.startsWith("image/") && showPreview) {
        try {
          const preview = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          uploadItem.preview = preview;
        } catch (err) {
          console.warn("Failed to generate preview:", err);
        }
      }
      
      newUploadItems.push(uploadItem);
      
      if (!error) {
        validFiles.push(file);
      }
    }
    
    setUploadItems(prev => [...prev, ...newUploadItems]);
    
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
      
      // Simulate upload progress
      newUploadItems.forEach(item => {
        if (item.status === "pending") {
          simulateUpload(item);
        }
      });
    }
  }, [disabled, acceptedTypes, maxFileSize, maxFiles, showPreview, onFilesSelected]);
  
  // Simulate upload progress
  const simulateUpload = useCallback(async (item: FileUploadItem) => {
    setUploadItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, status: "uploading" as const } : i
    ));
    
    // Simulate progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, progress } : i
      ));
    }
    
    // Complete upload
    setUploadItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, status: "success" as const, progress: 100 } : i
    ));
    
    onFileUploaded?.(item);
  }, [onFileUploaded]);
  
  // Drag handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [disabled, handleFiles]);
  
  // File input handler
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [handleFiles]);
  
  // Remove upload item
  const removeUploadItem = useCallback((id: string) => {
    setUploadItems(prev => prev.filter(item => item.id !== id));
  }, []);
  
  // Clear all completed
  const clearCompleted = useCallback(() => {
    setUploadItems(prev => prev.filter(item => item.status !== "success"));
  }, []);
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          {
            "border-zinc-300 dark:border-zinc-600 hover:border-teal-400 dark:hover:border-teal-500": !disabled && !isDragOver,
            "border-teal-500 bg-teal-50 dark:bg-teal-900/20": isDragOver,
            "border-zinc-200 dark:border-zinc-700 cursor-not-allowed opacity-50": disabled,
          }
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-4">
          <div className={cn(
            "mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            isDragOver 
              ? "bg-teal-100 dark:bg-teal-900/40" 
              : "bg-zinc-100 dark:bg-zinc-800"
          )}>
            <Upload className={cn(
              "w-6 h-6 transition-colors",
              isDragOver 
                ? "text-teal-600 dark:text-teal-400" 
                : "text-zinc-400"
            )} />
          </div>
          
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              {isDragOver ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              or click to browse
            </p>
          </div>
          
          {acceptedTypes.length > 0 && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Supports: {acceptedTypes.join(", ")}
            </p>
          )}
          
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Max {maxFiles} files, {maxFileSize}MB each
          </p>
        </div>
      </div>
      
      {/* Upload Progress */}
      {uploadItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-zinc-900 dark:text-white">
              Upload Progress ({uploadItems.length})
            </h4>
            {uploadItems.some(item => item.status === "success") && (
              <button
                onClick={clearCompleted}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Clear completed
              </button>
            )}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadItems.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
              >
                {/* File Preview/Icon */}
                <div className="flex-shrink-0">
                  {item.preview ? (
                    <img
                      src={item.preview}
                      alt={item.file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(item.file.type, "md")
                  )}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatFileSize(item.file.size)}
                  </p>
                  
                  {/* Progress Bar */}
                  {item.status === "uploading" && (
                    <div className="mt-2">
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1">
                        <div
                          className="bg-teal-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {item.progress}%
                      </p>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {item.error && (
                    <p className="text-xs text-red-500 mt-1">{item.error}</p>
                  )}
                </div>
                
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {item.status === "success" && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {item.status === "error" && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {item.status === "uploading" && (
                    <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => removeUploadItem(item.id)}
                  className="flex-shrink-0 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 