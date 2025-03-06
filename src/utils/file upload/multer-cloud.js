import multer, { diskStorage } from "multer";

export const fileValidation = {
  images: ["image/png", "image/jpeg", "image/webp"],
  files: ["application/pdf", "application/msword"],
  videos: ["video/mp4"],
};
export const cloudUpload = (allowTypes) => {
  const storage = diskStorage({});
  const fileFilter = (req, file, cb) => {
    if (!allowTypes.includes(file.mimetype)) {
      return cb(new Error("invalid file format!"), false);
    }
    return cb(null, true);
  };
  return multer({ storage, fileFilter });
};
