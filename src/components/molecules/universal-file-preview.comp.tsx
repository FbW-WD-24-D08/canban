import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Download, FileText, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface UniversalFilePreviewProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Navigation props
  files?: Array<{ id: string; name: string; type: string; url?: string; data?: string }>;
  currentFileId?: string;
  onNavigate?: (fileId: string) => void;
}

export function UniversalFilePreview({ 
  fileUrl, 
  fileName, 
  fileType, 
  open, 
  onOpenChange,
  files = [],
  currentFileId,
  onNavigate
}: UniversalFilePreviewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Navigation logic
  const currentIndex = files.findIndex(f => f.id === currentFileId);
  const canNavigatePrev = currentIndex > 0;
  const canNavigateNext = currentIndex < files.length - 1;

  const navigatePrev = useCallback(() => {
    if (canNavigatePrev && onNavigate) {
      onNavigate(files[currentIndex - 1].id);
    }
  }, [canNavigatePrev, onNavigate, files, currentIndex]);

  const navigateNext = useCallback(() => {
    if (canNavigateNext && onNavigate) {
      onNavigate(files[currentIndex + 1].id);
    }
  }, [canNavigateNext, onNavigate, files, currentIndex]);

  // Keyboard navigation with throttling
  useEffect(() => {
    let isThrottled = false;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Throttle keyboard events to prevent performance issues
      if (isThrottled) return;
      
      if (e.key === "ArrowLeft" && canNavigatePrev) {
        isThrottled = true;
        navigatePrev();
        setTimeout(() => { isThrottled = false; }, 100); // 100ms throttle
      } else if (e.key === "ArrowRight" && canNavigateNext) {
        isThrottled = true;
        navigateNext();
        setTimeout(() => { isThrottled = false; }, 100); // 100ms throttle
      } else if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canNavigatePrev, canNavigateNext, navigatePrev, navigateNext, onOpenChange]);

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
      // For PDFs, we don't need to load content - just use the URL directly
      if (isPdfFile(fileType)) {
        setContent(fileUrl);
        setLoading(false);
        return;
      }

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

  const isPdfFile = (type: string): boolean => {
    return type === 'application/pdf' || fileName.endsWith('.pdf');
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

    // Handle PDF files
    if (isPdfFile(fileType)) {
      const pdfUrl = content || fileUrl;
      
      // Don't render if no valid URL
      if (!pdfUrl || pdfUrl.trim() === '') {
        return (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="text-center">
              <FileText className="w-12 h-12 text-zinc-500 mx-auto mb-2" />
              <p className="text-zinc-400 text-sm">PDF file not available</p>
              <p className="text-zinc-500 text-xs mt-1">
                The PDF file could not be loaded
              </p>
            </div>
          </div>
        );
      }
      
      return (
        <div className="flex-1 overflow-hidden relative">
          {/* PDF Embed with proper error handling */}
          <div className="w-full h-full relative">
            <object
              data={pdfUrl}
              type="application/pdf"
              className="w-full h-full"
              title={`PDF Preview: ${fileName}`}
            >
              {/* Fallback iframe for better browser support */}
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full border-0"
                title={`PDF Preview: ${fileName}`}
                sandbox="allow-scripts allow-downloads"
              >
                {/* Final fallback for unsupported browsers */}
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <FileText className="w-16 h-16 text-zinc-500 mb-4" />
                  <p className="text-white text-lg mb-2">PDF Preview Not Supported</p>
                  <p className="text-zinc-400 text-sm mb-4">
                    Your browser doesn't support PDF preview. Please download the file to view it.
                  </p>
                  <a
                    href={pdfUrl}
                    download={fileName}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>
                </div>
              </iframe>
            </object>
          </div>
          
          {/* Download overlay - always available */}
          <div className="absolute top-4 right-4 z-10">
            <a
              href={pdfUrl}
              download={fileName}
              className="inline-flex items-center gap-2 px-3 py-2 bg-black/70 hover:bg-black/80 text-white rounded-md transition-colors text-sm backdrop-blur-sm"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
          
          {/* Navigation overlays for PDFs */}
          {canNavigatePrev && (
            <button
              onClick={navigatePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          
          {canNavigateNext && (
            <button
              onClick={navigateNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      );
    }

    if (!content) return null;

    // Render based on file type
    if (isImageFile(fileType)) {
      return (
        <div className="flex-1 flex items-center justify-center overflow-hidden p-4 relative">
          <img
            src={content}
            alt={fileName}
            className="max-w-full max-h-full object-contain"
          />
          
          {/* Navigation overlays for images */}
          {canNavigatePrev && (
            <button
              onClick={navigatePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          
          {canNavigateNext && (
            <button
              onClick={navigateNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      );
    }

    if (isMarkdownFile(fileType)) {
      return (
        <div className="flex-1 overflow-auto p-6">
          <div className="prose prose-invert prose-zinc max-w-none
            prose-headings:text-zinc-100 
            prose-p:text-zinc-200 
            prose-strong:text-zinc-100 
            prose-em:text-zinc-300
            prose-code:text-teal-300 prose-code:bg-zinc-800 prose-code:px-1 prose-code:rounded
            prose-pre:bg-zinc-800 prose-pre:text-zinc-200
            prose-blockquote:text-zinc-300 prose-blockquote:border-zinc-600
            prose-ul:text-zinc-200 prose-ol:text-zinc-200
            prose-li:text-zinc-200
            prose-a:text-teal-400 prose-a:no-underline hover:prose-a:text-teal-300
            prose-hr:border-zinc-700">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({ inline, children, ...props }: any) => {
                  return inline ? (
                    <code className="bg-zinc-800 text-teal-300 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-zinc-800 text-zinc-200 p-4 rounded-md overflow-x-auto">
                      <code className="text-sm font-mono">{children}</code>
                    </pre>
                  );
                },
                h1: ({ children }) => <h1 className="text-2xl font-bold text-zinc-100 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold text-zinc-100 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-medium text-zinc-100 mb-2">{children}</h3>,
                p: ({ children }) => <p className="text-zinc-200 mb-4 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="text-zinc-200 mb-4 pl-6 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="text-zinc-200 mb-4 pl-6 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-zinc-200">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-zinc-600 pl-4 py-2 text-zinc-300 italic bg-zinc-800/30 rounded-r">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-teal-400 hover:text-teal-300 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
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
    if (isPdfFile(fileType)) return "📄";
    if (fileType.includes('json')) return "📋";
    if (fileType.includes('javascript') || fileType.includes('typescript')) return "⚡";
    return "📄";
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1001]" />
        <Dialog.Content 
          className="group fixed left-1/2 top-1/2 w-[90vw] max-w-4xl h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-zinc-900 border border-zinc-800 shadow-lg z-[1002] flex flex-col"
        >
          <Dialog.Description className="sr-only">
            Preview of file {fileName} with type {fileType}. Use arrow keys to navigate between files.
          </Dialog.Description>
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Dialog.Title className="flex items-center gap-2 text-white min-w-0">
                <span className="text-lg">{getFileIcon()}</span>
                <span className="font-medium truncate">{fileName}</span>
                <span className="text-xs text-zinc-500 ml-2">
                  {fileType}
                </span>
              </Dialog.Title>
              
              {/* Navigation info */}
              {files.length > 1 && (
                <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                  {currentIndex + 1} of {files.length}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Navigation buttons */}
              {files.length > 1 && (
                <div className="flex items-center gap-1 mr-2">
                  <button
                    onClick={navigatePrev}
                    disabled={!canNavigatePrev}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous file (←)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={navigateNext}
                    disabled={!canNavigateNext}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next file (→)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
              
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