// Smart preview caching system
// Temporarily stores base64 data in database for preview, auto-cleans after close

import { tasksApi } from "@/api/tasks.api";
import type { Attachment } from "@/types/api.types";

class PreviewCache {
  private openPreviews = new Set<string>(); // Track open preview attachment IDs

  /**
   * Prepare attachment for preview
   * - If has data: return immediately
   * - If file: read and temporarily store in database
   * - If URL: fetch and temporarily store in database
   */
  async preparePreview(
    taskId: string, 
    attachment: Attachment, 
    allAttachments: Attachment[]
  ): Promise<string> {
    // Already has cached data
    if (attachment.data) {
      this.openPreviews.add(attachment.id);
      return attachment.data;
    }

    let previewData: string;

    // Handle file input (user just selected file)
    if (attachment.url?.startsWith('#')) {
      // This is a placeholder - we need the user to re-select the file
      throw new Error('Please re-select the file for preview');
    }

    // Handle external URL
    if (attachment.url) {
      try {
        const response = await fetch(attachment.url);
        const arrayBuffer = await response.arrayBuffer();
        const base64 = this.arrayBufferToBase64(arrayBuffer);
        previewData = `data:${attachment.type};base64,${base64}`;
      } catch (error) {
        throw new Error(`Failed to fetch file: ${error}`);
      }
    } else {
      throw new Error('No file data or URL available');
    }

    // Temporarily store in database for preview
    const updatedAttachment = { ...attachment, data: previewData };
    const updatedAttachments = allAttachments.map(att => 
      att.id === attachment.id ? updatedAttachment : att
    );

    await tasksApi.updateTask(taskId, { attachments: updatedAttachments });
    this.openPreviews.add(attachment.id);

    return previewData;
  }

  /**
   * Clean up preview data after preview closes
   */
  async cleanupPreview(
    taskId: string, 
    attachmentId: string, 
    allAttachments: Attachment[]
  ): Promise<void> {
    if (!this.openPreviews.has(attachmentId)) return;

    // Remove data but keep metadata
    const cleanedAttachments = allAttachments.map(att => {
      if (att.id === attachmentId) {
        const { data: _data, ...cleanAttachment } = att;
        return cleanAttachment;
      }
      return att;
    });

    await tasksApi.updateTask(taskId, { attachments: cleanedAttachments });
    this.openPreviews.delete(attachmentId);
  }

  /**
   * Handle file selection for preview
   */
  async handleFileSelection(file: File): Promise<Attachment> {
    const base64 = await this.fileToBase64(file);
    
    return {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      data: base64 // Store temporarily for immediate preview
    };
  }

  /**
   * Convert File to base64 data URL
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Cleanup all open previews (emergency cleanup)
   */
  async cleanupAllPreviews(taskId: string, allAttachments: Attachment[]): Promise<void> {
    if (this.openPreviews.size === 0) return;

    const cleanedAttachments = allAttachments.map(att => {
      if (this.openPreviews.has(att.id)) {
        const { data: _data, ...cleanAttachment } = att;
        return cleanAttachment;
      }
      return att;
    });

    await tasksApi.updateTask(taskId, { attachments: cleanedAttachments });
    this.openPreviews.clear();
  }
}

export const previewCache = new PreviewCache();