import * as Dialog from "@radix-ui/react-dialog";
import { X, FileText, Download, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";

interface UniversalFilePreviewProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UniversalFilePreview({ 
  fileUrl, 
  fileName, 
  fileType, 
  open, 
  onOpenChange 
}: UniversalFilePreviewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens/closes or file changes
  useEffect(() => {
    if (open && fileUrl) {
      loadContent();
    } else {
      setContent(null);
      setError(null);
    }
  }, [open, fileUrl]);

  const loadContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.statusText}`);
      }

      // Handle different content types
      if (isTextFile(fileType)) {
        const text = await response.text();
        setContent(text);
      } else if (isImageFile(fileType)) {
        // For images, we'll use the URL directly
        setContent(fileUrl);
      } else {
        throw new Error("Preview not supported for this file type");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load file");
    } finally {
      setLoading(false);
    }
  };

  const isTextFile = (type: string): boolean => {
    return type.startsWith('text/') || 
           type === 'application/json' ||
           type === 'application/javascript' ||
           type === 'application/typescript' ||
           type.includes('xml');
  };

  const isImageFile = (type: string): boolean => {
    return type.startsWith('image/');
  };

  const isMarkdownFile = (type: string): boolean => {
    return type === 'text/markdown' || fileName.endsWith('.md');
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading preview...
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <FileText className="w-12 h-12 text-zinc-500 mx-auto mb-2" />
            <p className="text-zinc-400 text-sm">{error}</p>
            <p className="text-zinc-500 text-xs mt-1">
              You can still download the file below
            </p>
          </div>
          <a
            href={fileUrl}
            download={fileName}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download File
          </a>
        </div>
      );
    }

    if (!content) return null;

    // Render based on file type
    if (isImageFile(fileType)) {
      return (
        <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
          <img
            src={content}
            alt={fileName}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }

    if (isMarkdownFile(fileType)) {
      return (
        <div className="flex-1 overflow-y-auto">
          <div className="prose prose-invert prose-zinc max-w-none p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </div>
      );
    }

    // Default text preview
    return (
      <div className="flex-1 overflow-y-auto">
        <pre className="p-4 text-sm text-zinc-300 font-mono whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    );
  };

  const getFileIcon = () => {
    if (isImageFile(fileType)) return "🖼️";
    if (isMarkdownFile(fileType)) return "📝";
    if (fileType.includes('json')) return "📋";
    if (fileType.includes('javascript') || fileType.includes('typescript')) return "⚡";
    return "📄";
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1001]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-4xl h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-zinc-900 border border-zinc-800 shadow-lg z-[1002] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <Dialog.Title className="flex items-center gap-2 text-white">
              <span className="text-lg">{getFileIcon()}</span>
              <span className="font-medium truncate">{fileName}</span>
              <span className="text-xs text-zinc-500 ml-2">
                {fileType}
              </span>
            </Dialog.Title>
            
            <div className="flex items-center gap-2">
              <a
                href={fileUrl}
                download={fileName}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </a>
              <Dialog.Close asChild>
                <button
                  aria-label="Close"
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Content */}
          {renderPreview()}
          
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}