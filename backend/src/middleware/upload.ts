import multer from 'multer';

// Configure multer to store files in memory (not on disk)
const storage = multer.memoryStorage();

// File filter to accept audio and video/webm files (MediaRecorder often creates video/webm for audio)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'audio/webm',
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/ogg',
    'video/webm', // MediaRecorder creates video/webm container for audio recordings
    'application/octet-stream' // Fallback when MIME type is not detected
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only audio files are allowed.`));
  }
};

// Configure multer with memory storage and file size limit
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter,
});
