import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadDir = path.isAbsolute(env.LOCAL_UPLOAD_DIR)
  ? env.LOCAL_UPLOAD_DIR
  : path.resolve(__dirname, '../../', env.LOCAL_UPLOAD_DIR);

export const ensureUploadDirExists = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`[Storage] Upload directory initialized at: ${uploadDir}`);
  }
};
