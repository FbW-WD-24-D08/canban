import { AlertCircle, Download, ExternalLink, File, FileText, Image, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size?: number;
  filePath?: string; // New: file path instead of data
  data?: string; // Legacy: for backwards compatibility
}

interface UniversalFilePreviewProps {
  attachment: Attachment;
  onClose: () => void;
  onDownload?: () => void;
}

const UniversalFilePreview: React.FC<UniversalFilePreviewProps> = ({
  attachment,
  onClose,
  onDownload
}) => {
  console.log('UniversalFilePreview rendered with attachment:', attachment);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    const initializePreview = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get file URL - use file path if available, otherwise fall back to data URL
        let url: string;
        if (attachment.filePath) {
          url = `/${attachment.filePath}`;
        } else if (attachment.data) {
          url = attachment.data;
        } else {
          throw new Error('No file data available');
        }

        setFileUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    initializePreview();
  }, [attachment]);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isImage = attachment.type.startsWith('image/');
  const isPDF = attachment.type === 'application/pdf';
  const isText = attachment.type.startsWith('text/') || attachment.type.includes('markdown');

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-2">Failed to load file</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        </div>
      );
    }

    if (!fileUrl) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No preview available</p>
          </div>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="flex items-center justify-center max-h-[70vh] overflow-auto">
          <img
            src={fileUrl}
            alt={attachment.name}
            className="max-w-full max-h-full object-contain rounded-lg"
            onError={() => setError('Failed to load image')}
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="h-[70vh] w-full">
          <iframe
            src={fileUrl}
            className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700"
            title={attachment.name}
            onError={() => setError('Failed to load PDF')}
          />
        </div>
      );
    }

    if (isText) {
      return (
        <div className="h-[70vh] w-full">
          <iframe
            src={fileUrl}
            className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            title={attachment.name}
            onError={() => setError('Failed to load text file')}
          />
        </div>
      );
    }

    // For other file types, show download option
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Preview not available for this file type
          </p>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download to view
          </button>
        </div>
      </div>
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 min-w-0">
            {isImage && <Image className="w-5 h-5 text-blue-500 flex-shrink-0" />}
            {isPDF && <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />}
            {!isImage && !isPDF && <File className="w-5 h-5 text-gray-500 flex-shrink-0" />}
            
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {attachment.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {attachment.type}
                {attachment.size && ` • ${formatFileSize(attachment.size)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            
            {fileUrl && (
              <button
                onClick={() => window.open(fileUrl, '_blank')}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default UniversalFilePreview;