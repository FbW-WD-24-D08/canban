import { FileText, Link, X } from "lucide-react";
import { useState } from "react";

interface Attachment {
  id: string;
  name: string;
  type: "url" | "file";
  url?: string;
}

interface SimpleAttachmentProps {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  disabled?: boolean;
}

export function SimpleAttachment({ 
  attachments, 
  onAttachmentsChange, 
  disabled 
}: SimpleAttachmentProps) {
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const addUrl = () => {
    if (!urlInput.trim()) return;
    
    const newAttachment: Attachment = {
      id: crypto.randomUUID(),
      name: urlInput.trim(),
      type: "url",
      url: urlInput.trim()
    };
    
    onAttachmentsChange([...attachments, newAttachment]);
    setUrlInput("");
    setShowUrlInput(false);
  };

  const addFileNames = (files: FileList) => {
    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: "file",
    }));
    
    onAttachmentsChange([...attachments, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter(att => att.id !== id));
  };

  const getIcon = (attachment: Attachment) => {
    if (attachment.type === "url") return <Link className="w-3 h-3" />;
    return <FileText className="w-3 h-3" />;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm text-zinc-400">Attachments</label>
      
      {/* Existing attachments */}
      {attachments.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {attachments.map(attachment => (
            <div key={attachment.id} className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-800 rounded px-2 py-1">
              {getIcon(attachment)}
              <span className="flex-1 truncate">
                {attachment.type === "url" ? (
                  <a 
                    href={attachment.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-teal-400 underline"
                  >
                    {attachment.name}
                  </a>
                ) : (
                  <span>{attachment.name}</span>
                )}
              </span>
              {!disabled && (
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-zinc-500 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add attachments */}
      {!disabled && (
        <div className="flex gap-2">
          <input
            type="file"
            multiple
            onChange={(e) => e.target.files && addFileNames(e.target.files)}
            className="text-xs text-zinc-400 file:bg-zinc-700 file:border-0 file:px-2 file:py-1 file:text-xs file:text-zinc-300 hover:file:bg-zinc-600"
          />
          
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="px-2 py-1 text-xs bg-zinc-700 text-zinc-300 rounded hover:bg-zinc-600 flex items-center gap-1"
          >
            <Link className="w-3 h-3" />
            URL
          </button>
        </div>
      )}

      {/* URL input */}
      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/file.pdf"
            className="flex-1 text-xs bg-zinc-800 border border-zinc-700 text-white p-2 rounded focus:border-teal-500 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && addUrl()}
          />
          <button
            onClick={addUrl}
            disabled={!urlInput.trim()}
            className="px-2 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}