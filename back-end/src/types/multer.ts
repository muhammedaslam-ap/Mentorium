// src/types/multer.ts
export interface MulterS3File extends Express.Multer.File {
  location: string; // comes from multer-s3 upload result
  key: string;
}
