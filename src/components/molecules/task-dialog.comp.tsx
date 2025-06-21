import { tasksApi } from "@/api/tasks.api";
import { previewCache } from "@/lib/preview-cache";
import type { Priority, Tag, Task, TimeEntry } from "@/types/api.types";
import * as Dialog from "@radix-ui/react-dialog";
import { FolderOpen, Paperclip, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { DatePicker } from "../atoms/due-date-indicator.comp";
import FileUploadZone from "../atoms/file-upload-zone.comp";
import { PrioritySelector } from "../atoms/priority-badge.comp";
import { TimeTracker } from "../atoms/time-tracker.comp";
import { useToast } from "../contexts/toast.context.tsx";
import { DeleteConfirmationModal } from "./confirmation-modal.comp.tsx";
import { FileManager } from "./file-manager.comp";
import { TagSelector } from "./tag-selector.comp";
import UniversalFilePreview from "./universal-file-preview.comp.tsx";

interface TaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved?: () => void;
  onDeleted?: () => void;
  isMeisterTask?: boolean;
}

export function TaskDialog({ 
  task, 
  open, 
  onOpenChange, 
  onSaved, 
  onDeleted,
  isMeisterTask = false 
}: TaskDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">(
    (task.status as any) || "todo"
  );
  const [priority, setPriority] = useState<Priority>(task.priority || "medium");
  const [dueDate, setDueDate] = useState<string | undefined>(task.dueDate);
  const [attachments, setAttachments] = useState(task.attachments || []);
  const [filePreview, setFilePreview] = useState<{ data: string; name: string; type: string; attachmentId: string } | null>(null);
  // Removed unused files state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const toast = useToast();

  // File management state
  const [showAdvancedFiles, setShowAdvancedFiles] = useState(false);
  const [fileManagerFiles, setFileManagerFiles] = useState<{
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string;
    data?: string;
    filePath?: string;
    createdAt: string;
    updatedAt: string;
    folderId?: string;
    tags?: string[];
    description?: string;
    version?: number;
    isShared?: boolean;
    sharedWith?: string[];
    thumbnail?: string;
  }[]>(
    attachments.map(att => ({
      id: att.id,
      name: att.name,
      type: att.type,
      size: (att as any).size || Math.floor(Math.random() * 5000000) + 100000, // Generate realistic size if not available
      url: att.url,
      data: att.data,
      filePath: att.filePath,
      createdAt: (att as any).createdAt || new Date().toISOString(),
      updatedAt: (att as any).updatedAt || new Date().toISOString(),
      folderId: undefined,
      tags: [],
      description: "",
      version: 1,
      isShared: false,
      sharedWith: [],
      thumbnail: (att as any).thumbnail
    }))
  );
  const [fileManagerFolders, setFileManagerFolders] = useState([
    { id: "images", name: "Images", createdAt: new Date().toISOString(), color: "#3B82F6", icon: "📷" },
    { id: "documents", name: "Documents", createdAt: new Date().toISOString(), color: "#10B981", icon: "📄" },
    { id: "archives", name: "Archives", createdAt: new Date().toISOString(), color: "#F59E0B", icon: "📦" }
  ]);

  // Tag management for MeisterTask boards
  const getTagColor = (tagName: string): string => {
    const colorMap: Record<string, string> = {
      'Frontend': 'blue',
      'Backend': 'green', 
      'Design': 'purple',
      'UI/UX': 'pink',
      'Security': 'red',
      'API': 'orange',
      'Testing': 'yellow',
      'Mobile': 'teal',
      'UX': 'pink',
      'Performance': 'green',
      'Database': 'gray',
      'Onboarding': 'blue'
    };
    return colorMap[tagName] || 'gray';
  };

  // Convert string tags to Tag objects
  const stringToTag = (tagName: string): Tag => ({
    id: tagName,
    name: tagName,
    color: getTagColor(tagName),
    boardId: '14e1'
  });

  // Available tags (in a real app, this would come from an API)
  const availableTags: Tag[] = [
    'Frontend', 'Backend', 'Design', 'UI/UX', 'Security', 'API', 
    'Testing', 'Mobile', 'UX', 'Performance', 'Database', 'Onboarding',
    'Bug', 'Feature', 'Enhancement', 'Documentation', 'Refactor'
  ].map(stringToTag);

  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    (task.tags || []).map(stringToTag)
  );
  
  // Time tracking state
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>(task.estimatedHours);
  const [actualHours, setActualHours] = useState<number>(task.actualHours || 0);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(task.timeEntries || []);

  const handleTagSelect = (tag: Tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleTagDeselect = (tagId: string) => {
    setSelectedTags(selectedTags.filter(t => t.id !== tagId));
  };

  const handleCreateTag = async (name: string, color: string): Promise<Tag> => {
    // In a real app, this would call an API to create the tag
    const newTag: Tag = {
      id: name,
      name,
      color,
      boardId: '14e1'
    };
    return newTag;
  };

  const handleAdvancedFileUpload = (files: File[]) => {
    // Convert File objects to FileManager format AND add to regular files
    const newFiles = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: undefined,
      data: undefined, // Will be set when file is processed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folderId: undefined,
      tags: [],
      description: "",
      version: 1,
      isShared: false,
      sharedWith: [],
      thumbnail: undefined
    }));
    
    setFileManagerFiles(prev => [...prev, ...newFiles]);
    // Files state removed - using fileManagerFiles instead
  };

  // Handle simple file upload (new approach)
  const handleSimpleFileUpload = (uploadedFiles: any[]) => {
    // Convert uploaded file metadata to attachments
    const newAttachments = uploadedFiles.map(uf => ({
      id: uf.id,
      name: uf.name,
      type: uf.type,
      size: uf.size,
      filePath: uf.filePath,
      data: undefined // No base64 data, use filePath instead
    }));
    
    // Add to attachments immediately
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  // Fix preview handling for both old and new attachments
  const handlePreview = useCallback(async (attachment: any) => {
    if (saving) {
      return;
    }
    
    try {
      setSaving(true);
      
      let previewData: string;
      
      // Handle new file path based attachments
      if (attachment.filePath) {
        previewData = `/${attachment.filePath}`;
        
        // Test if file is accessible before showing preview
        try {
          const response = await fetch(previewData, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error(`File not accessible: ${response.status}`);
          }
        } catch (fetchError) {
          console.warn('File not accessible via path, trying fallbacks...', fetchError);
          // Fallback to base64 data if file path fails
          if (attachment.data) {
            previewData = attachment.data;
          } else {
            throw new Error('File not found on server and no backup data available');
          }
        }
      }
      // Handle old base64 data attachments
      else if (attachment.data) {
        previewData = attachment.data;
      }
      // Fallback to preview cache for complex cases
      else {
        previewData = await previewCache.preparePreview(task.id, attachment, attachments);
      }
      
      setFilePreview({
        data: previewData,
        name: attachment.name,
        type: attachment.type,
        attachmentId: attachment.id
      });
    } catch (error) {
      console.error('Preview failed:', error);
      toast.error("Preview failed", `Could not preview file: ${attachment.name}. ${error}`);
    } finally {
      setSaving(false);
    }
  }, [task.id, attachments, saving, toast]);

  const closePreview = useCallback(async () => {
    if (filePreview) {
      try {
        await previewCache.cleanupPreview(task.id, filePreview.attachmentId, attachments);
      } catch (error) {
        console.error('Cleanup failed:', error);
      }
      setFilePreview(null);
    }
  }, [filePreview, task.id, attachments]);

  const removeAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter(att => att.id !== attachmentId));
  };

  const handleTimeLog = (entry: TimeEntry) => {
    setTimeEntries([...timeEntries, entry]);
  };

  const handleTimeUpdate = (totalHours: number) => {
    setActualHours(totalHours);
  };

  // Memoize heavy computations
  const handleFileManagerAction = useMemo(() => ({
    onFileUpload: handleAdvancedFileUpload,
    onFileDelete: (fileId: string) => {
      setFileManagerFiles(prev => prev.filter(f => f.id !== fileId));
      setAttachments(prev => prev.filter(att => att.id !== fileId));
    },
    onFileShare: (fileId: string, users: string[]) => {
      setFileManagerFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, isShared: true, sharedWith: users } : f
      ));
    },
    onFileDownload: (fileId: string) => {
      const file = fileManagerFiles.find(f => f.id === fileId);
      if (file) {
        if (file.filePath) {
          // New file path approach
          const link = document.createElement('a');
          link.href = `/${file.filePath}`;
          link.download = file.name;
          link.click();
        } else if (file.data) {
          // Old base64 approach
          const link = document.createElement('a');
          link.href = file.data;
          link.download = file.name;
          link.click();
        }
      }
    },
    onFilePreview: (file: any) => {
      if (saving) return;
      
      let previewData = '';
      if (file.filePath) {
        previewData = `/${file.filePath}`;
      } else if (file.data) {
        previewData = file.data;
      } else if (file.url) {
        previewData = file.url;
      }
      
      setFilePreview({
        data: previewData,
        name: file.name,
        type: file.type,
        attachmentId: file.id
      });
    },
    onFolderCreate: (name: string, parentId?: string) => {
      const newFolder = {
        id: `folder-${Date.now()}`,
        name,
        parentId,
        createdAt: new Date().toISOString(),
        color: "#6B7280",
        icon: "📁"
      };
      setFileManagerFolders(prev => [...prev, newFolder]);
    },
    onFileMoveToFolder: (fileId: string, folderId?: string) => {
      setFileManagerFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, folderId } : f
      ));
    }
  }), [fileManagerFiles, handleAdvancedFileUpload, saving]);

  const save = async () => {
    if (!title.trim()) return;
    try {
      setSaving(true);

      // Use existing attachments (which now include new uploads)
      const allAttachments = attachments;

      const updateData: any = {
        title,
        description: desc,
        status,
        attachments: allAttachments.length > 0 ? allAttachments : undefined,
      };

      // Add MeisterTask specific fields
      if (isMeisterTask) {
        updateData.priority = priority;
        updateData.dueDate = dueDate;
        updateData.tags = selectedTags.map(tag => tag.name);
        updateData.estimatedHours = estimatedHours;
        updateData.actualHours = actualHours;
        updateData.timeEntries = timeEntries;
      }

      await tasksApi.updateTask(task.id, updateData);
      
      // Files state removed - no cleanup needed
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await tasksApi.deleteTask(task.id);
      toast.success("Task deleted", "The task has been permanently deleted.");
      onDeleted?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Delete failed", "Could not delete the task. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Clean dark theme styling to match the main board
  const dialogBg = "bg-zinc-900";
  const titleColor = "text-white";
  const labelColor = "text-zinc-400";
  const inputBg = "bg-zinc-800 border-zinc-700";
  const inputText = "text-white";

  return (
    <>
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content 
          className={`fixed left-1/2 top-1/2 w-[90vw] max-w-2xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-lg ${dialogBg} shadow-lg border border-zinc-800 flex flex-col`}
        >
          <Dialog.Description className="sr-only">
            Edit task details including title, description, status, priority, and attachments for task: {task.title}
          </Dialog.Description>
          <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-800">
            <Dialog.Title className={`text-lg font-semibold ${titleColor}`}>
              Edit Task
            </Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
                <span className="sr-only">Close</span>
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-6 pt-4">
            <div className="space-y-4">
            <div>
              <label className={`block text-sm ${labelColor} mb-1`}>Title</label>
              <input
                className={`w-full rounded-md ${inputBg} border ${inputText} p-2 text-sm focus:border-teal-500 focus:outline-none`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
              />
            </div>
            
            <div>
              <label className={`block text-sm ${labelColor} mb-1`}>Description</label>
              <textarea
                className={`w-full h-24 rounded-md ${inputBg} border ${inputText} p-2 text-sm focus:border-teal-500 focus:outline-none`}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Description (optional)"
              />
            </div>

            {/* MeisterTask specific fields */}
            {isMeisterTask && (
              <div className="space-y-4">
                {/* Priority selector */}
                <div>
                  <PrioritySelector 
                    value={priority} 
                    onChange={setPriority}
                    className="mb-2"
                  />
                </div>
                
                {/* Due date picker */}
                <div>
                  <DatePicker
                    value={dueDate}
                    onChange={setDueDate}
                  />
                </div>

                {/* Tag selector */}
                <div>
                  <label className={`block text-sm ${labelColor} mb-2`}>Tags</label>
                  <TagSelector
                    selectedTags={selectedTags}
                    availableTags={availableTags}
                    onTagSelect={handleTagSelect}
                    onTagDeselect={handleTagDeselect}
                    onCreateTag={handleCreateTag}
                    maxTags={5}
                    placeholder="Search or create tags..."
                  />
                </div>

                {/* Time Tracker */}
                <div>
                  <label className={`block text-sm ${labelColor} mb-2`}>Time Tracking</label>
                  <TimeTracker
                    estimatedHours={estimatedHours}
                    actualHours={actualHours}
                    timeEntries={timeEntries.map(entry => ({
                      ...entry,
                      startTime: typeof entry.startTime === 'string' ? new Date(entry.startTime) : entry.startTime,
                      endTime: entry.endTime ? (typeof entry.endTime === 'string' ? new Date(entry.endTime) : entry.endTime) : undefined
                    }))}
                    onEstimateChange={setEstimatedHours}
                    onTimeLog={handleTimeLog}
                    onTimeUpdate={handleTimeUpdate}
                    size="sm"
                  />
                </div>
              </div>
            )}
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="file-input" className={`text-sm ${labelColor}`}>Attachments</label>
                <button
                  type="button"
                  onClick={() => setShowAdvancedFiles(!showAdvancedFiles)}
                  className={`flex items-center gap-1 text-xs ${showAdvancedFiles ? 'text-teal-400' : 'text-zinc-500'} hover:text-teal-300 transition-colors`}
                >
                  <FolderOpen className="w-3 h-3" />
                  {showAdvancedFiles ? 'Simple View' : 'Advanced Files'}
                </button>
              </div>
              
              {showAdvancedFiles ? (
                /* Advanced File Manager */
                <div className="border border-zinc-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <FileManager
                    files={fileManagerFiles}
                    folders={fileManagerFolders}
                    {...handleFileManagerAction}
                    className="text-sm"
                  />
                </div>
              ) : (
                /* Simple File Upload */
                <div className="space-y-3">
                  <FileUploadZone
                    onFilesUploaded={handleSimpleFileUpload}
                    acceptedTypes={["image/*", "application/pdf", "text/*", "application/zip"]}
                    maxSize={25 * 1024 * 1024} // 25MB in bytes
                    maxFiles={5}
                  />
                  
                  {/* Existing attachments */}
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <p className={`text-xs ${labelColor}`}>Current attachments:</p>
                      <ul className="space-y-1 max-h-32 overflow-y-auto">
                        {attachments.map((att) => {
                          const hasFilePath = !!att.filePath;
                          const hasData = !!att.data;
                          const isPreviewable = hasFilePath || hasData;
                          
                          return (
                            <li 
                              key={att.id} 
                              className={`flex items-center gap-2 p-2 rounded text-xs transition-all duration-200 ${
                                isPreviewable 
                                  ? 'bg-zinc-700/50 hover:bg-zinc-600/50 cursor-pointer' 
                                  : 'bg-zinc-800/50 cursor-not-allowed'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isPreviewable && !saving) {
                                  handlePreview(att);
                                }
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                if (isPreviewable && !saving) {
                                  handlePreview(att);
                                }
                              }}
                              title={isPreviewable ? `Click to preview ${att.name}` : 'File not available for preview'}
                            >
                              <Paperclip className={`w-3 h-3 ${
                                isPreviewable ? 'text-teal-400' : 'text-zinc-500'
                              }`} />
                              <div className={`flex-1 text-left truncate ${
                                isPreviewable 
                                  ? 'text-teal-200' 
                                  : 'text-zinc-400'
                              }`}>
                                {att.name}
                                {!isPreviewable && ' (unavailable)'}
                                {saving && ' (loading...)'}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeAttachment(att.id);
                                }}
                                className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/20 rounded"
                                disabled={saving}
                                title="Remove attachment"
                              >
                                ×
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Status selector - only for non-MeisterTask boards */}
            {!isMeisterTask && (
              <div>
                <label className={`block text-sm ${labelColor} mb-1`}>Status</label>
                <select
                  title="Task status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className={`w-full rounded-md ${inputBg} border ${inputText} p-2 text-sm focus:border-teal-500 focus:outline-none`}
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 p-6 pt-4 border-t border-zinc-800">
            <Dialog.Close asChild>
              <button className="px-4 py-2 rounded-md text-sm transition-colors bg-zinc-700 text-white hover:bg-zinc-600">
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving}
              className="px-4 py-2 rounded-md bg-red-600 text-sm text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 rounded-md bg-teal-600 text-sm text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
    
    {filePreview && (
      <UniversalFilePreview
        attachment={{
          id: filePreview.attachmentId,
          name: filePreview.name,
          type: filePreview.type,
          filePath: filePreview.data.startsWith('data:') ? undefined : filePreview.data,
          data: filePreview.data.startsWith('data:') ? filePreview.data : undefined
        }}
        onClose={closePreview}
        onDownload={() => {
          if (filePreview.data) {
            const link = document.createElement('a');
            link.href = filePreview.data;
            link.download = filePreview.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }}
      />
    )}
    
    <DeleteConfirmationModal
      open={showDeleteConfirm}
      onOpenChange={setShowDeleteConfirm}
      onConfirm={handleDelete}
      itemName={task.title}
      itemType="task"
      loading={saving}
    />
    </>
  );
}
