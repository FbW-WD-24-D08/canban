import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Download, Eye, Filter, Folder, FolderOpen, Grid3X3, List, MoreHorizontal, Search, Share2, SortAsc, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { FileUploadZone } from "../atoms/file-upload-zone.comp";

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: string;
  createdAt: string;
  updatedAt: string;
  folderId?: string;
  tags?: string[];
  description?: string;
  version?: number;
  isShared?: boolean;
  sharedWith?: string[];
  thumbnail?: string;
}

interface FolderItem {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
  color?: string;
  icon?: string;
  description?: string;
}

interface FileManagerProps {
  files: FileItem[];
  folders: FolderItem[];
  onFileUpload: (files: File[]) => void;
  onFileDelete: (fileId: string) => void;
  onFileShare: (fileId: string, users: string[]) => void;
  onFileDownload: (fileId: string) => void;
  onFilePreview: (file: FileItem) => void;
  onFolderCreate: (name: string, parentId?: string) => void;
  onFileMoveToFolder?: (fileId: string, folderId?: string) => void;
  className?: string;
}

type ViewMode = "grid" | "list";
type SortBy = "name" | "date" | "size" | "type";
type FilterBy = "all" | "images" | "documents" | "archives" | "shared";

// Get file type category
function getFileCategory(type: string): FilterBy {
  if (type.startsWith("image/")) return "images";
  if (type.includes("pdf") || type.includes("document") || type.includes("text")) return "documents";
  if (type.includes("zip") || type.includes("rar") || type.includes("tar")) return "archives";
  return "all";
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return "Today";
  } else if (diffInHours < 48) {
    return "Yesterday";
  } else if (diffInHours < 168) { // 7 days
    return `${Math.floor(diffInHours / 24)} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function FileManager({
  files,
  folders,
  onFileUpload,
  onFileDelete,
  onFileShare,
  onFileDownload,
  onFilePreview,
  onFolderCreate,
  onFileMoveToFolder,
  className = ""
}: FileManagerProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [filterBy, setFilterBy] = useState<FilterBy>("all");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  
  // Filter and sort files
  const filteredFiles = useMemo(() => {
    const filtered = files.filter(file => {
      // Folder filter
      if (file.folderId !== currentFolderId) return false;
      
      // Search filter
      if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filterBy !== "all") {
        if (filterBy === "shared" && !file.isShared) return false;
        if (filterBy !== "shared" && getFileCategory(file.type) !== filterBy) return false;
      }
      
      return true;
    });
    
    // Sort files
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "size":
          return b.size - a.size;
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [files, currentFolderId, searchQuery, filterBy, sortBy]);
  
  // Get current folder for breadcrumbs
  const breadcrumbs = useMemo(() => {
    if (!currentFolderId) return [];
    
    const crumbs: FolderItem[] = [];
    let folderId: string | undefined = currentFolderId;
    
    while (folderId) {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) break;
      
      crumbs.unshift(folder);
      folderId = folder.parentId;
    }
    
    return crumbs;
  }, [currentFolderId, folders]);
  
  // Get subfolders
  const subfolders = folders.filter(f => f.parentId === currentFolderId);
  
  // Handle file selection
  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };
  
  // Drag and drop handlers - properly implemented
  const handleDragStart = (fileId: string) => {
    setDraggedFileId(fileId);
  };

  const handleDragEnd = () => {
    setDraggedFileId(null);
    setDragOverFolderId(null);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDragOverFolderId(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleDrop = (e: React.DragEvent, folderId?: string) => {
    e.preventDefault();
    if (draggedFileId && onFileMoveToFolder) {
      onFileMoveToFolder(draggedFileId, folderId);
    }
    setDraggedFileId(null);
    setDragOverFolderId(null);
  };
  
  // Create folder
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onFolderCreate(newFolderName.trim(), currentFolderId);
      setNewFolderName("");
      setShowCreateFolder(false);
    }
  };
  
  // File actions
  const handleFileAction = (action: string, file: FileItem) => {
    switch (action) {
      case "preview":
        onFilePreview(file);
        break;
      case "download":
        onFileDownload(file.id);
        break;
      case "delete":
        onFileDelete(file.id);
        break;
      case "share":
        onFileShare(file.id, []);
        break;
    }
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm">
          <button
            onClick={() => setCurrentFolderId(undefined)}
            className={cn(
              "px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
              !currentFolderId ? "text-teal-600 dark:text-teal-400 font-medium" : "text-zinc-600 dark:text-zinc-400"
            )}
          >
            All Files
          </button>
          
          {breadcrumbs.map((folder, index) => (
            <div key={folder.id} className="flex items-center space-x-2">
              <span className="text-zinc-400">/</span>
              <button
                onClick={() => setCurrentFolderId(folder.id)}
                className={cn(
                  "px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                  index === breadcrumbs.length - 1 
                    ? "text-teal-600 dark:text-teal-400 font-medium" 
                    : "text-zinc-600 dark:text-zinc-400"
                )}
              >
                {folder.name}
              </button>
            </div>
          ))}
        </nav>
        
        {/* Search and Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
              />
            </div>
            
            {/* Filter */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="min-w-[160px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-1">
                  {[
                    { value: "all", label: "All Files" },
                    { value: "images", label: "Images" },
                    { value: "documents", label: "Documents" },
                    { value: "archives", label: "Archives" },
                    { value: "shared", label: "Shared" }
                  ].map(option => (
                    <DropdownMenu.Item
                      key={option.value}
                      onSelect={() => setFilterBy(option.value as FilterBy)}
                      className={cn(
                        "px-2 py-1 text-sm rounded cursor-pointer outline-none",
                        filterBy === option.value
                          ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      )}
                    >
                      {option.label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            
            {/* Sort */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                  <SortAsc className="w-4 h-4" />
                  Sort
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="min-w-[160px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-1">
                  {[
                    { value: "name", label: "Name" },
                    { value: "date", label: "Date Modified" },
                    { value: "size", label: "Size" },
                    { value: "type", label: "Type" }
                  ].map(option => (
                    <DropdownMenu.Item
                      key={option.value}
                      onSelect={() => setSortBy(option.value as SortBy)}
                      className={cn(
                        "px-2 py-1 text-sm rounded cursor-pointer outline-none",
                        sortBy === option.value
                          ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      )}
                    >
                      {option.label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "grid"
                    ? "bg-teal-500 text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "list"
                    ? "bg-teal-500 text-white"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            {/* Create Folder */}
            <button
              onClick={() => setShowCreateFolder(true)}
              className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
            >
              New Folder
            </button>
          </div>
        </div>
      </div>
      
      {/* Upload Zone */}
      <FileUploadZone
        onFilesSelected={onFileUpload}
        acceptedTypes={["image/*", "application/pdf", "text/*", "application/zip"]}
        maxFileSize={50}
        maxFiles={10}
      />
      
      {/* File Grid/List */}
      <div 
        className="space-y-4"
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragOverFolderId) {
            // Allow dropping in root if not over a specific folder
          }
        }}
        onDrop={(e) => {
          // Only handle drop if not over a specific folder
          if (!dragOverFolderId) {
            handleDrop(e, undefined);
          }
        }}
      >
        {/* Folders */}
        {subfolders.length > 0 && (
          <div>
            <h3 className="text-sm font-medium file-text-primary mb-3">Folders</h3>
            <div className={cn(
              viewMode === "grid" 
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                : "space-y-2"
            )}>
              {subfolders.map(folder => (
                <div
                  key={folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                  onDragOver={(e) => handleDragOver(e, folder.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, folder.id)}
                  className={cn(
                    "folder-item group cursor-pointer rounded-lg relative",
                    dragOverFolderId === folder.id
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 scale-105"
                      : "",
                    viewMode === "grid" 
                      ? "p-4 text-center"
                      : "p-3 flex items-center gap-3"
                  )}
                >
                  <FolderOpen className={cn(
                    "text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform",
                    dragOverFolderId === folder.id && "text-teal-500 scale-110",
                    viewMode === "grid" ? "w-8 h-8 mx-auto mb-2" : "w-5 h-5"
                  )} />
                  <div className={cn(
                    viewMode === "grid" ? "space-y-1" : "flex-1"
                  )}>
                    <p className="text-sm file-text-primary truncate">
                      {folder.name || "Untitled Folder"}
                    </p>
                    {folder.description && (
                      <p className="text-xs file-text-muted truncate">
                        {folder.description}
                      </p>
                    )}
                    <p className="text-xs file-text-muted">
                      {formatDate(folder.createdAt)}
                    </p>
                  </div>
                  
                  {/* Drop indicator */}
                  {dragOverFolderId === folder.id && (
                    <div className="absolute inset-0 rounded-lg border-2 border-dashed border-teal-500 bg-teal-500/10 flex items-center justify-center pointer-events-none">
                      <span className="text-teal-600 dark:text-teal-400 text-xs font-medium">
                        Drop here
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Files */}
        {filteredFiles.length > 0 && (
          <div>
            <h3 className="text-sm font-medium file-text-primary mb-3">
              Files ({filteredFiles.length})
            </h3>
            <div className={cn(
              viewMode === "grid" 
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                : "space-y-2"
            )}>
              {filteredFiles.map(file => (
                <FileItem
                  key={file.id}
                  file={file}
                  viewMode={viewMode}
                  isSelected={selectedFiles.has(file.id)}
                  onSelect={() => toggleFileSelection(file.id)}
                  onAction={(action) => handleFileAction(action, file)}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedFileId === file.id}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {filteredFiles.length === 0 && subfolders.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400">
              {searchQuery ? "No files found matching your search" : "No files in this folder"}
            </p>
          </div>
        )}
      </div>
      
      {/* Create Folder Dialog */}
      <Dialog.Root open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-lg border border-zinc-200 dark:border-zinc-800">
            <Dialog.Title className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Create New Folder
            </Dialog.Title>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                autoFocus
              />
              
              <div className="flex justify-end gap-2">
                <Dialog.Close asChild>
                  <button className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

// File Item Component
interface FileItemProps {
  file: FileItem;
  viewMode: ViewMode;
  isSelected: boolean;
  onSelect: () => void;
  onAction: (action: string) => void;
  onDragStart: (fileId: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

function FileItem({ file, viewMode, isSelected, onSelect, onAction, onDragStart, onDragEnd, isDragging }: FileItemProps) {
  const fileIcon = getFileIcon(file.type);
  
  // Generate thumbnail for images
  const generateThumbnail = (file: FileItem) => {
    if (file.thumbnail) return file.thumbnail;
    if (file.data && file.type.startsWith('image/')) return file.data;
    if (file.url && file.type.startsWith('image/')) return file.url;
    return null;
  };
  
  const thumbnail = generateThumbnail(file);
  
  if (viewMode === "grid") {
    return (
      <div
        draggable
        onDragStart={() => onDragStart(file.id)}
        onDragEnd={onDragEnd}
        className={cn(
          "file-item group relative rounded-lg p-4 text-center cursor-pointer hover:shadow-md",
          isSelected && "file-item-selected",
          isDragging && "opacity-50 scale-95"
        )}
        onClick={onSelect}
        onDoubleClick={() => onAction("preview")}
      >
        {/* Thumbnail or Icon */}
        <div className="mb-3">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={file.name}
              className="w-12 h-12 mx-auto object-cover rounded border border-zinc-200 dark:border-zinc-700"
            />
          ) : (
            <div className="w-12 h-12 mx-auto flex items-center justify-center">
              {fileIcon}
            </div>
          )}
        </div>
        
        {/* File Info */}
        <div className="space-y-1">
          <p className="text-sm file-text-primary truncate">
            {file.name}
          </p>
          <p className="text-xs file-text-secondary">
            {formatFileSize(file.size)}
          </p>
          <p className="text-xs file-text-muted">
            {formatDate(file.updatedAt)}
          </p>
        </div>
        
        {/* Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="p-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[140px] modal-bg modal-border rounded-lg shadow-lg p-1">
                <DropdownMenu.Item
                  onSelect={() => onAction("preview")}
                  className="flex items-center gap-2 px-2 py-1 text-sm file-text-primary hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => onAction("download")}
                  className="flex items-center gap-2 px-2 py-1 text-sm file-text-primary hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => onAction("share")}
                  className="flex items-center gap-2 px-2 py-1 text-sm file-text-primary hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                <DropdownMenu.Item
                  onSelect={() => onAction("delete")}
                  className="flex items-center gap-2 px-2 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
        
        {/* Shared Indicator */}
        {file.isShared && (
          <div className="absolute top-2 left-2">
            <Share2 className="w-4 h-4 text-teal-500" />
          </div>
        )}
      </div>
    );
  }
  
  // List view
  return (
    <div
      draggable
      onDragStart={() => onDragStart(file.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "file-item group flex items-center gap-4 p-3 rounded-lg cursor-pointer",
        isSelected && "file-item-selected",
        isDragging && "opacity-50"
      )}
      onClick={onSelect}
      onDoubleClick={() => onAction("preview")}
    >
      {/* Icon/Thumbnail */}
      <div className="flex-shrink-0">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={file.name}
            className="w-8 h-8 object-cover rounded border border-zinc-200 dark:border-zinc-700"
          />
        ) : (
          fileIcon
        )}
      </div>
      
      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm file-text-primary truncate">
          {file.name}
        </p>
        <div className="flex items-center gap-4 text-xs file-text-secondary">
          <span>{formatFileSize(file.size)}</span>
          <span>{formatDate(file.updatedAt)}</span>
          {file.isShared && (
            <span className="flex items-center gap-1">
              <Share2 className="w-3 h-3" />
              Shared
            </span>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="min-w-[140px] modal-bg modal-border rounded-lg shadow-lg p-1">
              <DropdownMenu.Item
                onSelect={() => onAction("preview")}
                className="flex items-center gap-2 px-2 py-1 text-sm file-text-primary hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                Preview
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => onAction("download")}
                className="flex items-center gap-2 px-2 py-1 text-sm file-text-primary hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => onAction("share")}
                className="flex items-center gap-2 px-2 py-1 text-sm file-text-primary hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Share
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-zinc-200 dark:bg-zinc-700" />
              <DropdownMenu.Item
                onSelect={() => onAction("delete")}
                className="flex items-center gap-2 px-2 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}

// Get file icon helper
function getFileIcon(type: string) {
  if (type.startsWith("image/")) {
    return <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">IMG</div>;
  } else if (type.includes("pdf")) {
    return <div className="w-6 h-6 bg-red-100 dark:bg-red-900/20 rounded flex items-center justify-center text-red-600 dark:text-red-400 text-xs font-bold">PDF</div>;
  } else if (type.includes("zip") || type.includes("rar")) {
    return <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/20 rounded flex items-center justify-center text-yellow-600 dark:text-yellow-400 text-xs font-bold">ZIP</div>;
  } else if (type.includes("text") || type.includes("markdown")) {
    return <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded flex items-center justify-center text-green-600 dark:text-green-400 text-xs font-bold">TXT</div>;
  } else {
    return <div className="w-6 h-6 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center text-zinc-600 dark:text-zinc-400 text-xs font-bold">FILE</div>;
  }
} 