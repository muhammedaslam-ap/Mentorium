"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lessonVideoUploadMiddleware = exports.verificationUploadMiddleware = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});
// Sanitize file name to remove spaces and special characters
const sanitizeFileName = (fileName) => {
    return fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_+/g, '_')
        .toLowerCase();
};
// Uploader for verification documents (JPEG, PNG, PDF)
const verificationUpload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3Client,
        bucket: process.env.S3_BUCKET_NAME || 'mentorium',
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            const sanitizedFileName = sanitizeFileName(path_1.default.basename(file.originalname, ext));
            const fileName = `${(0, uuid_1.v4)()}${ext}`;
            const key = `verification-documents/${fileName}`;
            console.log(`Uploading file to S3 with key: ${key} (original: ${file.originalname})`);
            cb(null, key);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    },
}).single('verificationDoc');
// Uploader for lesson videos (MP4, AVI, MOV)
const lessonVideoUpload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3Client,
        bucket: process.env.S3_BUCKET_NAME || 'mentorium',
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            const sanitizedFileName = sanitizeFileName(path_1.default.basename(file.originalname, ext));
            const fileName = `${(0, uuid_1.v4)()}${ext}`;
            const key = `lesson-videos/${fileName}`;
            console.log(`Uploading video to S3 with key: ${key} (original: ${file.originalname})`);
            cb(null, key);
        },
    }),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /mp4|avi|mov/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Only MP4, AVI, and MOV are allowed.'));
    },
}).single('video');
// Middleware for verification documents
const verificationUploadMiddleware = (req, res, next) => {
    verificationUpload(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            console.error('Multer error:', err.message, err);
            return res.status(400).json({ message: `Multer error: ${err.message}` });
        }
        else if (err) {
            console.error('S3 upload error:', err.message, err);
            return res.status(400).json({ message: `File upload error: ${err.message}` });
        }
        console.log('verificationUploadMiddleware - File:', req.file);
        next();
    });
};
exports.verificationUploadMiddleware = verificationUploadMiddleware;
// Middleware for lesson videos
const lessonVideoUploadMiddleware = (req, res, next) => {
    lessonVideoUpload(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            console.error('Multer error:', err.message, err);
            return res.status(400).json({ message: `Multer error: ${err.message}` });
        }
        else if (err) {
            console.error('S3 video upload error:', err.message, err);
            return res.status(400).json({ message: `Video upload error: ${err.message}` });
        }
        console.log('lessonVideoUploadMiddleware - File:', req.file);
        next();
    });
};
exports.lessonVideoUploadMiddleware = lessonVideoUploadMiddleware;
