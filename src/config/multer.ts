import multer from 'multer';
import { BadRequestError } from '@/utils/ApiError';
import {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
} from '@/api/validators/resume.validator';
import path from 'path';

// Use memory storage - files will be in req.file.buffer
const storage = multer.memoryStorage();

// File filter
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check mime type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new BadRequestError(
        `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
      )
    );
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new BadRequestError(
        `Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
      )
    );
  }

  cb(null, true);
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Error handler for multer errors
export const handleMulterError = (
  error: unknown,
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      throw new BadRequestError(
        `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      throw new BadRequestError('Unexpected file field');
    }
    throw new BadRequestError(`File upload error: ${error.message}`);
  }
  next(error);
};
