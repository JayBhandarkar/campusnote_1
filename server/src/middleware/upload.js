import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { uploadDir, ensureUploadDirExists } from '../config/storage.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

ensureUploadDirExists();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate safe unique storage filename: timestamp-randomHex-cleanExt
    const randomHex = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${randomHex}${ext}`;
    cb(null, safeName);
  },
});

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (ALLOWED_EXTENSIONS.includes(ext) && (ALLOWED_MIME_TYPES.includes(mime) || mime === 'application/octet-stream')) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Unsupported file type '${ext}'. Only PDF, PPT, PPTX, DOC, and DOCX files are allowed.`
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter,
});
