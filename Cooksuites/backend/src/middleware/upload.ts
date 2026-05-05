import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.') as Error & {
        statusCode?: number;
        code?: string;
      };
      error.statusCode = 400;
      error.code = 'INVALID_FILE_TYPE';
      cb(error);
    }
  }
});
