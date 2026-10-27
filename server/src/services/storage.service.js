import fs from 'fs';
import path from 'path';
import { uploadDir } from '../config/storage.js';

class LocalStorageDriver {
  constructor() {
    this.uploadDir = uploadDir;
  }

  getFilePath(storageName) {
    // Prevent directory traversal attacks
    const safePath = path.resolve(this.uploadDir, path.basename(storageName));
    if (!safePath.startsWith(path.resolve(this.uploadDir))) {
      throw new Error('Access denied: Path traversal attempt detected');
    }
    return safePath;
  }

  fileExists(storageName) {
    const filePath = this.getFilePath(storageName);
    return fs.existsSync(filePath);
  }

  deleteFile(storageName) {
    return new Promise((resolve) => {
      try {
        const filePath = this.getFilePath(storageName);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error(`[Storage] Failed to delete file ${filePath}:`, err.message);
            resolve(!err);
          });
        } else {
          resolve(true);
        }
      } catch (err) {
        console.error(`[Storage] Error during file deletion:`, err.message);
        resolve(false);
      }
    });
  }

  getFileStream(storageName, options = {}) {
    const filePath = this.getFilePath(storageName);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found in storage');
    }
    return fs.createReadStream(filePath, options);
  }

  getFileSize(storageName) {
    const filePath = this.getFilePath(storageName);
    const stats = fs.statSync(filePath);
    return stats.size;
  }
}

export const storageService = new LocalStorageDriver();
