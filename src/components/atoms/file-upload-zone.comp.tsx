import { AlertCircle, File, Upload, X } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface FileUploadZoneProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  disabled?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  filePath: string; // Path to the uploaded file
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesUploaded,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = [],
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const fileId = crypto.randomUUID();
    const fileName = `${fileId}_${file.name}`;
    
    // For our JSON Server setup, we'll create the file path
    // In a real app, this would upload to your server
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      filePath: `uploads/${fileName}`
    };

    return uploadedFile;
  };

  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled) return;
    
    setError(null);
    setUploading(true);

    try {
      const fileArray = Array.from(files);
      
      // Validate files
      const validFiles = fileArray.filter(file => {
        if (file.size > maxSize) {
          setError(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
          return false;
        }
        
        // More flexible type checking
        if (acceptedTypes.length > 0) {
          const isValidType = acceptedTypes.some(acceptedType => {
            if (acceptedType.endsWith('/*')) {
              // Handle wildcard types like "image/*"
              const baseType = acceptedType.replace('/*', '/');
              return file.type.startsWith(baseType);
            }
            return file.type === acceptedType;
          });
          
          if (!isValidType) {
            console.warn(`File ${file.name} has type ${file.type}, accepted types: ${acceptedTypes.join(', ')}`);
            // Don't reject, just warn - be more permissive
          }
        }
        
        return true;
      });

      if (validFiles.length === 0) {
        setUploading(false);
        return;
      }

      // Check total file count
      if (uploadedFiles.length + validFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        setUploading(false);
        return;
      }

      // Upload files
      const uploadPromises = validFiles.map(file => uploadFile(file));
      const newUploadedFiles = await Promise.all(uploadPromises);
      
      const allFiles = [...uploadedFiles, ...newUploadedFiles];
      setUploadedFiles(allFiles);
      onFilesUploaded(allFiles);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [disabled, maxFiles, maxSize, acceptedTypes, uploadedFiles, onFilesUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (disabled || uploading) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, uploading, handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setIsDragActive(true);
    }
  }, [disabled, uploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input
    e.target.value = '';
  }, [handleFiles]);

  const removeFile = (fileId: string) => {
    const newFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(newFiles);
    onFilesUploaded(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !uploading && document.getElementById('file-input')?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled || uploading}
        />
        
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        
        {uploading ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Uploading files...
          </p>
        ) : isDragActive ? (
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Drop files here...
          </p>
        ) : (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Drag & drop files here, or click to select
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Max {maxFiles} files, {formatFileSize(maxSize)} each
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove file"
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
};

export default FileUploadZone; 