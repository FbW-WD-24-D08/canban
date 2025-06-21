// Client-side file storage using IndexedDB
// Files stored in browser, only metadata in database

interface FileMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  taskId?: string;
  created_at: Date;
  filePath: string; // Path to the uploaded file
  hasPreview: boolean;
}

// Removed unused FileData interface

class FileStorage {
  // Removed unused UPLOADS_DIR constant

  /**
   * Save a file and return metadata
   */
  async saveFile(file: File, taskId?: string): Promise<FileMetadata> {
    const fileId = crypto.randomUUID();
    const fileName = `${fileId}_${file.name}`;
    const filePath = `uploads/${fileName}`;

    // In a real application, you would upload to your server
    // For now, we'll create a data URL for immediate use
    await this.fileToDataUrl(file);

    // Store file metadata
    const metadata: FileMetadata = {
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      taskId,
      created_at: new Date(),
      filePath,
      hasPreview: this.canPreview(file.type),
    };

    return metadata;
  }

  /**
   * Convert file to data URL for immediate use
   */
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Check if file type can be previewed
   */
  private canPreview(type: string): boolean {
    return (
      type.startsWith("image/") ||
      type === "application/pdf" ||
      type.startsWith("text/") ||
      type.includes("markdown")
    );
  }

  /**
   * Get file URL for display/download
   */
  getFileUrl(filePath: string): string {
    return `/${filePath}`;
  }

  /**
   * Generate thumbnail for images (simplified)
   */
  async generateThumbnail(file: File): Promise<string | null> {
    if (!file.type.startsWith("image/")) {
      return null;
    }

    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Set thumbnail size
        const maxSize = 150;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw scaled image
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to data URL
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };

      img.onerror = () => resolve(null);

      // Create object URL for the file
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    });
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  /**
   * Get file icon based on type
   */
  getFileIcon(type: string): string {
    if (type.startsWith("image/")) return "🖼️";
    if (type === "application/pdf") return "📄";
    if (type.startsWith("text/")) return "📝";
    if (type.includes("json")) return "📋";
    if (type.includes("javascript") || type.includes("typescript")) return "⚡";
    if (type.includes("zip") || type.includes("rar")) return "📦";
    if (type.includes("video/")) return "🎥";
    if (type.includes("audio/")) return "🎵";
    return "📄";
  }

  /**
   * Validate file before upload
   */
  validateFile(
    file: File,
    maxSize: number = 10 * 1024 * 1024
  ): { valid: boolean; error?: string } {
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${this.formatFileSize(maxSize)} limit`,
      };
    }

    // Add more validation rules as needed
    const dangerousTypes = [
      "application/x-executable",
      "application/x-msdownload",
      "application/x-msdos-program",
    ];

    if (dangerousTypes.includes(file.type)) {
      return {
        valid: false,
        error: "File type not allowed for security reasons",
      };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const fileStorage = new FileStorage();
export type { FileMetadata };
