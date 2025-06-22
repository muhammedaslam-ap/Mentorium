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
exports.TutorService = void 0;
const aws_sdk_1 = require("aws-sdk");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});
class TutorService {
    constructor(tutorRepository) {
        this.tutorRepository = tutorRepository;
    }
    addTutorProfile(tutorId, profileData, verificationDocUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.tutorRepository.createTutorProfile(tutorId, profileData, verificationDocUrl);
        });
    }
    getTutorProfile(tutorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.tutorRepository.getTutorProfile(tutorId);
        });
    }
    getPresignedUrl(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const s3 = new aws_sdk_1.S3({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: process.env.AWS_REGION,
            });
            return s3.getSignedUrl('getObject', {
                Bucket: process.env.S3_BUCKET_NAME || '',
                Key: key,
                Expires: 60 * 5,
            });
        });
    }
    updateTutorProfile(tutorId, profileData, file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!tutorId) {
                console.error('updateTutorProfile - Tutor ID is required');
                throw new Error('Tutor ID is required');
            }
            const updateData = Object.assign({}, profileData);
            let newVerificationDocUrl;
            let newKey;
            let oldKey;
            if (file) {
                newVerificationDocUrl = file.location;
                newKey = file.key;
                console.log(`Verifying new S3 file:---------- ${newKey} (URL:-------------- ${newVerificationDocUrl})`);
                try {
                    yield s3Client.send(new client_s3_1.HeadObjectCommand({
                        Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
                        Key: newKey,
                    }));
                    console.log(`New file verified in S3: ${newKey}`);
                }
                catch (error) {
                    console.error(`Failed to verify new S3 file: ${newKey}`, error);
                    throw new Error(`Failed to verify uploaded document in S3: ${error.message}`);
                }
                try {
                    const currentProfile = yield this.tutorRepository.getTutorProfile(tutorId);
                    console.log(`Current profile for tutorId: ${tutorId}`, {
                        verificationDocUrl: currentProfile === null || currentProfile === void 0 ? void 0 : currentProfile.verificationDocUrl,
                    });
                    if (currentProfile === null || currentProfile === void 0 ? void 0 : currentProfile.verificationDocUrl) {
                        const urlParts = currentProfile.verificationDocUrl.split('/');
                        oldKey = urlParts.slice(3).join('/');
                        console.log(`Old S3 file to delete:------------ ${oldKey}`);
                    }
                }
                catch (error) {
                    console.error(`Failed to fetch current profile for tutorId: ${tutorId}`, error);
                }
                updateData.verificationDocUrl = newVerificationDocUrl;
            }
            console.log(`Preparing to update profile for tutorId: -----${tutorId}`, { updateData });
            try {
                yield this.tutorRepository.updateTutorProfile(tutorId, updateData);
                console.log(`Profile updated successfully for tutorId:------------ ${tutorId}`, { updateData });
                if (oldKey && newVerificationDocUrl) {
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
            }
            catch (error) {
                console.error(`Failed to update tutor profile for tutorId: ${tutorId}`, error);
                if (newKey) {
                    try {
                        yield s3Client.send(new client_s3_1.DeleteObjectCommand({
                            Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
                            Key: newKey,
                        }));
                        console.log(`Deleted new S3 file due to update failure: ${newKey}`);
                    }
                    catch (deleteError) {
                        console.error(`Failed to delete new S3 file: ${newKey}`, deleteError);
                    }
                }
                throw new Error(`Failed to update tutor profile: ${error.message}`);
            }
        });
    }
    getEnrolledStudent(tutorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { students, totalRevenue } = yield this.tutorRepository.getEnrolledStudent(tutorId);
            return { students, totalRevenue };
        });
    }
    markAllNotificationsAsRead(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.tutorRepository.markAllNotificationsAsRead(id);
        });
    }
    getNotification(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.tutorRepository.getNotifications(id);
        });
    }
    markNotificationAsRead(userId, notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.tutorRepository.markNotificationAsRead(userId, notificationId);
        });
    }
    sendCommunityNotifications(communityId, senderId, message, courseTitle) {
        return __awaiter(this, void 0, void 0, function* () {
            const userIds = yield this.getCommunityMembers(communityId);
            const filteredUserIds = userIds.filter((id) => id !== senderId);
            console.log("helloowoowww from sendCommunication notification");
            yield this.tutorRepository.saveCommunityNotifications(communityId, {
                type: "chat_message",
                message: `${message.sender} sent a message: ${message.content ? message.content.slice(0, 50) + "..." : "Sent an image"}`,
                communityId,
                courseTitle,
                senderId,
                createdAt: new Date(),
            }, filteredUserIds);
        });
    }
    getCommunityMembers(communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    getTutorProfileWithCourses(tutorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.tutorRepository.fetchTutorDataRepository(tutorId);
        });
    }
}
exports.TutorService = TutorService;
