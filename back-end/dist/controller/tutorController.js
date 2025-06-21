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
exports.TutorController = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const constant_1 = require("../shared/constant");
const custom_error_1 = require("../utils/custom.error");
const cloudinaryURL_1 = require("../utils/cloudinaryURL");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});
class TutorController {
    constructor(tutorService) {
        this.tutorService = tutorService;
    }
    getNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { id } = user;
                const notifications = yield this.tutorService.getNotification(id);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
                    notifications,
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    res.status(error.statusCode).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
                console.log(error);
                res
                    .status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                    .json({ success: false, message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    markAllNotificationsAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.user.id;
                yield this.tutorService.markAllNotificationsAsRead(id);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.UPDATE_SUCCESS,
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    res
                        .status(error.statusCode)
                        .json({ success: false, message: error.message });
                    return;
                }
                console.log(error);
                res
                    .status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                    .json({ success: false, message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    markNotificationAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.user;
                const notificationId = req.params.id;
                yield this.tutorService.markNotificationAsRead(id, notificationId);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.UPDATE_SUCCESS,
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    res
                        .status(error.statusCode)
                        .json({ success: false, message: error.message });
                    return;
                }
                console.log(error);
                res
                    .status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                    .json({ success: false, message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    addTutorProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tutorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { name, specialization, phone, bio } = req.body;
                console.log('addTutorProfile - Full request body:', req.body);
                console.log('addTutorProfile - Extracted fields:', { name, specialization, phone, bio });
                console.log('addTutorProfile - Request file:', req.file);
                if (!tutorId) {
                    console.error('addTutorProfile - No tutor ID found');
                    res.status(constant_1.HTTP_STATUS.UNAUTHORIZED).json({ message: constant_1.ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
                    return;
                }
                if (!specialization) {
                    console.error('addTutorProfile - Specialization is required');
                    res.status(constant_1.HTTP_STATUS.BAD_REQUEST).json({ message: constant_1.ERROR_MESSAGES.INCOMPLETE_INFO });
                    return;
                }
                if (!phone) {
                    console.error('addTutorProfile - Phone number is required');
                    res.status(constant_1.HTTP_STATUS.BAD_REQUEST).json({ message: constant_1.ERROR_MESSAGES.INCOMPLETE_INFO });
                    return;
                }
                if (!req.file) {
                    console.error('addTutorProfile - No verification document uploaded');
                    res.status(constant_1.HTTP_STATUS.BAD_REQUEST).json({ message: constant_1.ERROR_MESSAGES.MISSING_PARAMETERS });
                    return;
                }
                const file = req.file;
                const verificationDocUrl = file.location;
                const key = file.key;
                console.log(`Verifying S3 file existence for key: ${key} (URL: ${verificationDocUrl})`);
                try {
                    yield s3Client.send(new client_s3_1.HeadObjectCommand({
                        Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
                        Key: key,
                    }));
                    console.log(`File verified in S3: ${key}`);
                }
                catch (error) {
                    console.error(`Failed to verify S3 file: ${key}`, error);
                    res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
                    return;
                }
                const profileData = {
                    name,
                    specialization,
                    phone,
                    bio,
                    verificationDocUrl,
                };
                try {
                    yield this.tutorService.addTutorProfile(tutorId, profileData, verificationDocUrl);
                    console.log(`Tutor profile created for tutorId: ${tutorId}, verificationDocUrl: ${verificationDocUrl}`);
                    res.status(constant_1.HTTP_STATUS.CREATED).json({
                        message: constant_1.SUCCESS_MESSAGES.CREATED,
                        document: verificationDocUrl,
                    });
                }
                catch (error) {
                    console.error('Failed to save tutor profile:', error.message);
                    try {
                        yield s3Client.send(new client_s3_1.DeleteObjectCommand({
                            Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
                            Key: key,
                        }));
                        console.log(`Deleted S3 file: ${key} due to profile creation failure`);
                    }
                    catch (deleteError) {
                        console.error(`Failed to delete S3 file: ${key}`, deleteError);
                    }
                    res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
                }
            }
            catch (error) {
                console.error('Error adding tutor profile:', error.message);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    getEnrolledStudent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tutorId = req.user.id;
                const { students, totalRevenue } = yield this.tutorService.getEnrolledStudent(tutorId);
                res.status(constant_1.HTTP_STATUS.CREATED).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
                    students,
                    totalRevenue,
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    res
                        .status(error.statusCode)
                        .json({ success: false, message: error.message });
                    return;
                }
                console.log(error);
                res
                    .status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                    .json({ success: false, message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    getTutorProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tutorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                console.log(`Fetching profile for tutorId: ${tutorId}`);
                const profile = yield this.tutorService.getTutorProfile(tutorId);
                if (!profile) {
                    console.log(`Profile not found for tutorId: ${tutorId}`);
                    res.status(constant_1.HTTP_STATUS.NOT_FOUND).json({ message: constant_1.ERROR_MESSAGES.USER_NOT_FOUND });
                    return;
                }
                console.log(`Profile fetched:`, profile);
                res.status(constant_1.HTTP_STATUS.OK).json({ profile, message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS });
            }
            catch (error) {
                console.error('Error fetching tutor profile:', error.message);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    updateTutorProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tutorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { name, specialization, phone, bio } = req.body;
                console.log(`Updating profile for tutorId: ${tutorId}`, { name, specialization, phone, bio });
                console.log('updateTutorProfile - Request file: ------------->', req.file);
                if (!tutorId) {
                    console.error('updateTutorProfile - No tutor ID found');
                    res.status(constant_1.HTTP_STATUS.UNAUTHORIZED).json({ message: constant_1.ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
                    return;
                }
                const profileData = { name, specialization, phone, bio };
                yield this.tutorService.updateTutorProfile(tutorId, profileData, req.file);
                console.log(`Profile updated for tutorId: ${tutorId}`);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    message: constant_1.SUCCESS_MESSAGES.UPDATE_SUCCESS,
                    document: req.file ? req.file.location : undefined,
                });
            }
            catch (error) {
                console.error('Error updating tutor profile:', error.message);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    getDocumentPresignedUrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tutorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                console.log(`Generating pre-signed URL for tutorId: ${tutorId}`);
                const profile = yield this.tutorService.getTutorProfile(tutorId);
                if (!profile || !profile.verificationDocUrl) {
                    console.log(`No document found for tutorId: ${tutorId}`);
                    res.status(constant_1.HTTP_STATUS.NOT_FOUND).json({ message: constant_1.ERROR_MESSAGES.USER_NOT_FOUND });
                    return;
                }
                const urlParts = profile.verificationDocUrl.split('/');
                const key = urlParts.slice(3).join('/');
                console.log(`Generating pre-signed URL for key: ${key}`);
                const presignedUrl = yield this.tutorService.getPresignedUrl(key);
                console.log(`Pre-signed URL generated: ${presignedUrl}`);
                res.status(constant_1.HTTP_STATUS.OK).json({ url: presignedUrl, message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS });
            }
            catch (error) {
                console.error('Error generating pre-signed URL:', error.message);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    tutorProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tutorId } = req.params;
                const { tutorProfile, courses } = yield this.tutorService.getTutorProfileWithCourses(tutorId);
                const updatedCourses = courses
                    ? yield Promise.all(courses.map((course) => __awaiter(this, void 0, void 0, function* () {
                        if (course.thumbnail) {
                            console.log("COURSE THUMBNAIL", course.thumbnail);
                            course.thumbnail = yield (0, cloudinaryURL_1.createSecureUrl)(course.thumbnail, 'image');
                        }
                        return course;
                    })))
                    : [];
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
                    courses: updatedCourses,
                    tutorProfile,
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message || "Something went wrong",
                });
            }
        });
    }
}
exports.TutorController = TutorController;
