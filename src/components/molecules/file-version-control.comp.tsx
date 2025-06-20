import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tooltip from "@radix-ui/react-tooltip";
import { AlertCircle, Clock, Download, Eye, FileText, GitBranch, History, RotateCcw, User } from "lucide-react";
import { useState } from "react";

interface FileVersion {
  id: string;
  version: number;
  name: string;
  size: number;
  type: string;
  url?: string;
  data?: string;
  createdAt: string;
  createdBy: string;
  changes: string;
  isActive: boolean;
  checksum?: string;
  thumbnail?: string;
}

interface FileVersionControlProps {
  fileId: string;
  fileName: string;
  versions: FileVersion[];
  onVersionRestore: (versionId: string) => void;
  onVersionDownload: (versionId: string) => void;
  onVersionPreview: (version: FileVersion) => void;
  className?: string;
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Format date relative
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 168) { // 7 days
    const days = Math.floor(diffInHours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Get version status
function getVersionStatus(version: FileVersion, allVersions: FileVersion[]) {
  if (version.isActive) {
    return { type: "current", label: "Current", color: "text-green-600 dark:text-green-400" };
  }
  
  const isLatest = Math.max(...allVersions.map(v => v.version)) === version.version;
  if (isLatest && !version.isActive) {
    return { type: "latest", label: "Latest", color: "text-blue-600 dark:text-blue-400" };
  }
  
  return { type: "archived", label: "Archived", color: "text-zinc-500 dark:text-zinc-400" };
}

// Get file type icon
function getFileTypeIcon(type: string) {
  if (type.startsWith("image/")) {
    return <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">IMG</div>;
  } else if (type.includes("pdf")) {
    return <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded flex items-center justify-center text-red-600 dark:text-red-400 text-xs font-bold">PDF</div>;
  } else if (type.includes("document") || type.includes("text")) {
    return <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded flex items-center justify-center text-green-600 dark:text-green-400 text-xs font-bold">DOC</div>;
  } else {
    return <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center text-zinc-600 dark:text-zinc-400 text-xs font-bold">FILE</div>;
  }
}

export function FileVersionControl({
  fileId,
  fileName,
  versions,
  onVersionRestore,
  onVersionDownload,
  onVersionPreview,
  className = ""
}: FileVersionControlProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<FileVersion | null>(null);
  
  // Sort versions by version number (descending)
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);
  
  // Get version differences
  const getVersionDiff = (version: FileVersion, previousVersion?: FileVersion) => {
    if (!previousVersion) return null;
    
    const sizeDiff = version.size - previousVersion.size;
    const sizeDiffPercent = previousVersion.size > 0 ? ((sizeDiff / previousVersion.size) * 100) : 0;
    
    return {
      sizeDiff,
      sizeDiffPercent: Math.abs(sizeDiffPercent),
      isLarger: sizeDiff > 0,
      hasChanges: version.checksum !== previousVersion.checksum
    };
  };
  
  const handleRestoreClick = (version: FileVersion) => {
    setVersionToRestore(version);
    setShowRestoreDialog(true);
  };
  
  const handleRestoreConfirm = () => {
    if (versionToRestore) {
      onVersionRestore(versionToRestore.id);
      setShowRestoreDialog(false);
      setVersionToRestore(null);
    }
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Version History
        </h3>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          ({versions.length} version{versions.length !== 1 ? 's' : ''})
        </span>
      </div>
      
      {/* File Info */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
        <div className="flex items-center gap-3">
          {getFileTypeIcon(versions[0]?.type || "")}
          <div>
            <p className="font-medium text-zinc-900 dark:text-white">{fileName}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              File ID: {fileId}
            </p>
          </div>
        </div>
      </div>
      
      {/* Version Timeline */}
      <div className="space-y-3">
        {sortedVersions.map((version, index) => {
          const previousVersion = sortedVersions[index + 1];
          const diff = getVersionDiff(version, previousVersion);
          const status = getVersionStatus(version, versions);
          const isSelected = selectedVersion === version.id;
          
          return (
            <div
              key={version.id}
              className={cn(
                "relative border rounded-lg p-4 transition-all duration-200 cursor-pointer",
                isSelected
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
              )}
              onClick={() => setSelectedVersion(isSelected ? null : version.id)}
            >
              {/* Version Timeline Line */}
              {index < sortedVersions.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />
              )}
              
              {/* Version Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Version Badge */}
                  <div className={cn(
                    "relative w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10",
                    version.isActive
                      ? "bg-green-500 text-white"
                      : "bg-zinc-300 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-300"
                  )}>
                    {version.version}
                    {version.isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  {/* Version Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-zinc-900 dark:text-white">
                        Version {version.version}
                      </p>
                      <span className={cn("text-xs font-medium", status.color)}>
                        {status.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeDate(version.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {version.createdBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {formatFileSize(version.size)}
                      </span>
                    </div>
                    
                    {/* Changes Description */}
                    {version.changes && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {version.changes}
                      </p>
                    )}
                    
                    {/* Version Diff */}
                    {diff && (
                      <div className="flex items-center gap-2 mt-2">
                        {diff.hasChanges && (
                          <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Content changed
                          </span>
                        )}
                        {diff.sizeDiff !== 0 && (
                          <span className={cn(
                            "text-xs flex items-center gap-1",
                            diff.isLarger
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400"
                          )}>
                            {diff.isLarger ? "↗" : "↘"}
                            {diff.sizeDiffPercent.toFixed(1)}% size change
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Version Actions */}
                <div className="flex items-center gap-1">
                  <Tooltip.Provider delayDuration={300}>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVersionPreview(version);
                          }}
                          className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content className="px-2 py-1 text-xs bg-zinc-900 text-white rounded shadow-lg">
                          Preview version
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                  
                  <Tooltip.Provider delayDuration={300}>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVersionDownload(version.id);
                          }}
                          className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content className="px-2 py-1 text-xs bg-zinc-900 text-white rounded shadow-lg">
                          Download version
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                  
                  {!version.isActive && (
                    <Tooltip.Provider delayDuration={300}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreClick(version);
                            }}
                            className="p-2 text-teal-500 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content className="px-2 py-1 text-xs bg-zinc-900 text-white rounded shadow-lg">
                            Restore this version
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  )}
                </div>
              </div>
              
              {/* Expanded Details */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white mb-1">Technical Details</p>
                      <div className="space-y-1 text-zinc-600 dark:text-zinc-400">
                        <p>Type: {version.type}</p>
                        <p>Size: {formatFileSize(version.size)}</p>
                        {version.checksum && (
                          <p className="font-mono text-xs">Checksum: {version.checksum.slice(0, 8)}...</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white mb-1">Version Info</p>
                      <div className="space-y-1 text-zinc-600 dark:text-zinc-400">
                        <p>Created: {new Date(version.createdAt).toLocaleString()}</p>
                        <p>Author: {version.createdBy}</p>
                        <p>Status: {status.label}</p>
                      </div>
                    </div>
                  </div>
                  
                  {version.thumbnail && (
                    <div className="mt-4">
                      <p className="font-medium text-zinc-900 dark:text-white mb-2">Preview</p>
                      <img
                        src={version.thumbnail}
                        alt={`Version ${version.version} preview`}
                        className="max-w-32 max-h-32 object-cover rounded border border-zinc-200 dark:border-zinc-700"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Empty State */}
      {versions.length === 0 && (
        <div className="text-center py-8">
          <GitBranch className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">No version history available</p>
        </div>
      )}
      
      {/* Restore Confirmation Dialog */}
      <Dialog.Root open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-lg border border-zinc-200 dark:border-zinc-800">
            <Dialog.Title className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Restore Version {versionToRestore?.version}?
            </Dialog.Title>
            
            <div className="space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                This will restore version {versionToRestore?.version} as the current version. 
                The current version will be preserved in the version history.
              </p>
              
              {versionToRestore && (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileTypeIcon(versionToRestore.type)}
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        Version {versionToRestore.version}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {formatFileSize(versionToRestore.size)} • {formatRelativeDate(versionToRestore.createdAt)}
                      </p>
                      {versionToRestore.changes && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                          {versionToRestore.changes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Dialog.Close asChild>
                  <button className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleRestoreConfirm}
                  className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Restore Version
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
} 