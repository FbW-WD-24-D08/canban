import { Download, Eye, File, Trash2 } from 'lucide-react';
import React from 'react';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size?: number;
  filePath?: string; // New: file path instead of data
  data?: string; // Legacy: for backwards compatibility
}

interface SimpleAttachmentProps {
  attachment: Attachment;
  onDelete?: (id: string) => void;
  onPreview?: (attachment: Attachment) => void;
}

const SimpleAttachment: React.FC<SimpleAttachmentProps> = ({
  attachment,
  onDelete,
  onPreview
}) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileUrl = () => {
    // Use file path if available, otherwise fall back to data URL
    if (attachment.filePath) {
      return `/${attachment.filePath}`; // Serve from public directory
    }
    return attachment.data; // Legacy base64 data
  };

  const handleDownload = () => {
    const url = getFileUrl();
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(attachment);
    }
  };

  const isImage = attachment.type.startsWith('image/');
  const isPDF = attachment.type === 'application/pdf';
  const canPreview = isImage || isPDF;

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex-shrink-0">
        <File className="w-5 h-5 text-gray-500" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {attachment.name}
        </p>
        {attachment.size && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(attachment.size)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        {canPreview && (
          <button
            onClick={handlePreview}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        
        <button
          onClick={handleDownload}
          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>

        {onDelete && (
          <button
            onClick={() => onDelete(attachment.id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SimpleAttachment;