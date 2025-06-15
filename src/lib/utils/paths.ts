import path from 'path';

/**
 * Normalizes file paths across different operating systems
 * Ensures consistent path handling between Windows and Unix-based systems
 */
export const normalizePath = (filePath: string): string => {
  return filePath.split(path.sep).join('/');
};

/**
 * Resolves a path relative to the project root
 * Works consistently across different operating systems
 */
export const resolveProjectPath = (relativePath: string): string => {
  // In browser context, we don't have access to __dirname
  // This is primarily for server-side or build-time usage
  if (typeof window === 'undefined') {
    const projectRoot = path.resolve(process.cwd());
    return path.join(projectRoot, relativePath);
  }
  
  return relativePath;
};

/**
 * Returns the platform-specific path separator
 * Useful for creating paths that work on the current OS
 */
export const getPathSeparator = (): string => {
  return path.sep;
};

/**
 * Checks if the current environment is Windows
 */
export const isWindows = (): boolean => {
  return path.sep === '\\';
}; 