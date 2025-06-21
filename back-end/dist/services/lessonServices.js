"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const course_1 = require("../models/course");
const lessonModel_1 = require("../models/lessonModel");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});
class LessonService {
    constructor(lessonRepository) {
        this.lessonRepository = lessonRepository;
    }
    addLesson(tutorId, lessonData, file) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            if (!tutorId)
                throw new Error('Tutor ID is required');
            if (!file)
                throw new Error('Video file is required');
            let newKey;
            if (file) {
                newKey = file.key;
                const fileExtension = (_a = newKey.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                if (!fileExtension || !['mp4', 'webm', 'ogg'].includes(fileExtension)) {
                    throw new Error('Only MP4, WebM, or OGG videos are supported');
                }
                if (!['mp4', 'webm', 'ogg'].includes(fileExtension)) {
                    throw new Error('Only MP4, WebM, or OGG videos are supported');
                }
            }
            const coursedatas = yield lessonModel_1.lessonModel.find({ courseId: lessonData.courseId });
            const alreadyExisted = coursedatas.filter((curr) => {
                return curr.order === lessonData.order;
            });
            if (alreadyExisted.length > 0) {
                throw new Error('this lesson order is already existed');
            }
            const course = yield course_1.courseModel.findById(lessonData.courseId);
            if (!course)
                throw new Error('Course not found');
            if (course.tutorId.toString() !== tutorId)
                throw new Error('Unauthorized: You do not own this course');
            const key = file.key;
            console.log(`Verifying S3 file: ${key} (URL: ${file.location})`);
            try {
                yield s3Client.send(new client_s3_1.HeadObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
                    Key: key,
                }));
                console.log(`File verified in S3: ${key}`);
            }
            catch (error) {
                console.error(`Failed to verify S3 file: ${key}`, error);
                throw new Error(`Failed to verify uploaded video in S3: ${error.message}`);
            }
            const lessonInput = Object.assign(Object.assign({}, lessonData), { file: key });
            try {
                yield this.lessonRepository.createLesson(lessonInput);
                console.log(`Lesson created for courseId: ${lessonData.courseId}`);
                const createdLesson = yield lessonModel_1.lessonModel
                    .findOne({
                    courseId: lessonData.courseId,
                    title: lessonData.title,
                    description: lessonData.description,
                    file: key,
                })
                    .lean()
                    .exec();
                if (!createdLesson)
                    throw new Error('Failed to retrieve created lesson');
                const lesson = {
                    _id: createdLesson._id.toString(),
                    title: createdLesson.title,
                    courseId: createdLesson.courseId.toString(),
                    description: createdLesson.description,
                    file: createdLesson.file,
                    duration: (_b = createdLesson.duration) !== null && _b !== void 0 ? _b : undefined,
                    order: (_c = createdLesson.order) !== null && _c !== void 0 ? _c : undefined,
                    createdAt: (_d = createdLesson.createdAt) === null || _d === void 0 ? void 0 : _d.toISOString(),
                    updatedAt: (_e = createdLesson.updatedAt) === null || _e === void 0 ? void 0 : _e.toISOString(),
                };
                const presignedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, new client_s3_1.GetObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
                    Key: key,
                }), { expiresIn: 3600 });
                return Object.assign(Object.assign({}, lesson), { file: presignedUrl });
            }
            catch (error) {
                try {
                    yield s3Client.send(new client_s3_1.DeleteObjectCommand({
                        Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
                        Key: key,
                    }));
                    console.log(`Deleted S3 file: ${key} due to lesson creation failure`);
                }
                catch (deleteError) {
                    console.error(`Failed to delete S3 file: ${key}`, deleteError);
                }
                throw new Error(`Failed to create lesson: ${error.message}`);
            }
        });
    }
    getLessonById(lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            const lesson = yield this.lessonRepository.getLessonById(lessonId);
            if (!lesson)
                return null;
            const presignedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, new client_s3_1.GetObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
                Key: lesson.file,
            }), { expiresIn: 3600 });
            return Object.assign(Object.assign({}, lesson), { file: presignedUrl });
        });
    }
    getLessonsByCourseId(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const lessons = yield this.lessonRepository.getLessonsByCourseId(courseId);
            const lessonsWithPresignedUrls = yield Promise.all(lessons.map((lesson) => __awaiter(this, void 0, void 0, function* () {
                const presignedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, new client_s3_1.GetObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
                    Key: lesson.file,
                }), { expiresIn: 3600 });
                return Object.assign(Object.assign({}, lesson), { file: presignedUrl });
            })));
            return lessonsWithPresignedUrls;
        });
    }
    updateLesson(tutorId, lessonId, lessonData, file) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!tutorId)
                throw new Error('Tutor ID is required');
            const lesson = yield this.lessonRepository.getLessonById(lessonId);
            if (!lesson)
                throw new Error('Lesson not found');
            const course = yield course_1.courseModel.findById(lesson.courseId);
            if (!course)
                throw new Error('Course not found');
            if (course.tutorId.toString() !== tutorId)
                throw new Error('Unauthorized: You do not own this course');
            const updateData = Object.assign({}, lessonData);
            let newKey;
            let oldKey;
            if (file) {
                newKey = file.key;
                const fileExtension = (_a = newKey.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                if (!fileExtension || !['mp4', 'webm', 'ogg'].includes(fileExtension)) {
                    throw new Error('Only MP4, WebM, or OGG videos are supported');
                }
                if (!['mp4', 'webm', 'ogg'].includes(fileExtension)) {
                    throw new Error('Only MP4, WebM, or OGG videos are supported');
                }
                console.log(`Verifying new S3 file: ${newKey} (URL: ${file.location})`);
                try {
                    yield s3Client.send(new client_s3_1.HeadObjectCommand({
                        Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
                        Key: newKey,
                    }));
                    console.log(`New file verified in S3: ${newKey}`);
                }
                catch (error) {
                    console.error(`Failed to verify new S3 file: ${newKey}`, error);
                    throw new Error(`Failed to verify uploaded video in S3: ${error.message}`);
                }
                if (lesson.file) {
                    oldKey = lesson.file;
                    console.log(`Old S3 file to delete: ${oldKey}`);
                }
                updateData.file = newKey;
            }
            try {
                yield this.lessonRepository.updateLesson(lessonId, updateData);
                console.log(`Lesson updated: ${lessonId}`);
                if (oldKey && newKey) {
                    try {
                        yield s3Client.send(new client_s3_1.DeleteObjectCommand({
                            Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
                            Key: oldKey,
                        }));
                        console.log(`Deleted old S3 file: ${oldKey}`);
                    }
                    catch (deleteError) {
                        console.error(`Failed to delete old S3 file: ${oldKey}`, deleteError);
                    }
                }
                const updatedLesson = yield this.lessonRepository.getLessonById(lessonId);
                if (!updatedLesson)
                    throw new Error('Failed to retrieve updated lesson');
                const presignedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, new client_s3_1.GetObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
                    Key: updateData.file || lesson.file,
                }), { expiresIn: 3600 });
                return Object.assign(Object.assign({}, updatedLesson), { file: presignedUrl });
            }
            catch (error) {
                if (newKey) {
                    try {
                        yield s3Client.send(new client_s3_1.DeleteObjectCommand({
                            Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
                            Key: newKey,
                        }));
                        console.log(`Deleted new S3 file: ${newKey} due to update failure`);
                    }
                    catch (deleteError) {
                        console.error(`Failed to delete new S3 file: ${newKey}`, deleteError);
                    }
                }
                throw new Error(`Failed to update lesson: ${error.message}`);
            }
        });
    }
    deleteLesson(tutorId, lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!tutorId)
                throw new Error('Tutor ID is required');
            const lesson = yield this.lessonRepository.getLessonById(lessonId);
            if (!lesson)
                throw new Error('Lesson not found');
            const course = yield course_1.courseModel.findById(lesson.courseId);
            if (!course)
                throw new Error('Course not found');
            if (course.tutorId.toString() !== tutorId)
                throw new Error('Unauthorized: You do not own this course');
            const key = lesson.file;
            console.log(`S3 file to delete: ${key}`);
            try {
                yield this.lessonRepository.deleteLesson(lessonId);
                console.log(`Lesson deleted: ${lessonId}`);
                if (key) {
                    try {
                        yield s3Client.send(new client_s3_1.DeleteObjectCommand({
                            Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
                            Key: key,
                        }));
                        console.log(`Deleted S3 file: ${key}`);
                    }
                    catch (deleteError) {
                        console.error(`Failed to delete S3 file: ${key}`, deleteError);
                    }
                }
            }
            catch (error) {
                throw new Error(`Failed to delete lesson: ${error.message}`);
            }
        });
    }
}
exports.LessonService = LessonService;
