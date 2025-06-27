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
exports.StudentController = void 0;
const constant_1 = require("../shared/constant");
class StudentController {
    constructor(studentService) {
        this.studentService = studentService;
    }
    addStudentProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const studentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { aboutMe, education, interests } = req.body;
                console.log("addStudentProfile - studentId:", studentId, "body:", req.body);
                if (!studentId) {
                    res.status(constant_1.HTTP_STATUS.UNAUTHORIZED).json({ message: constant_1.ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
                    return;
                }
                if (!aboutMe || !education || !interests) {
                    res.status(constant_1.HTTP_STATUS.BAD_REQUEST).json({ message: constant_1.ERROR_MESSAGES.VALIDATION_ERROR });
                    return;
                }
                const profileData = {
                    studentId,
                    aboutMe,
                    education,
                    interests,
                };
                yield this.studentService.addStudentProfile(studentId, profileData);
                res.status(constant_1.HTTP_STATUS.CREATED).json({ message: constant_1.SUCCESS_MESSAGES.CREATED });
            }
            catch (error) {
                console.error("Error adding student profile:", error);
                const message = error instanceof Error && error.message === constant_1.ERROR_MESSAGES.EMAIL_EXISTS
                    ? error.message
                    : constant_1.ERROR_MESSAGES.SERVER_ERROR;
                const status = message === constant_1.ERROR_MESSAGES.EMAIL_EXISTS
                    ? constant_1.HTTP_STATUS.BAD_REQUEST
                    : constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
                res.status(status).json({ message });
            }
        });
    }
    getStudentProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const studentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                console.log("getStudentProfile - studentId:", studentId);
                if (!studentId) {
                    res.status(constant_1.HTTP_STATUS.UNAUTHORIZED).json({ message: constant_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
                    return;
                }
                const profile = yield this.studentService.getStudentProfile(studentId);
                if (!profile) {
                    res.status(constant_1.HTTP_STATUS.NOT_FOUND).json({ message: constant_1.ERROR_MESSAGES.CREATE_USER_PROFILE });
                    return;
                }
                res.status(constant_1.HTTP_STATUS.OK).json({ message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS, profile });
            }
            catch (error) {
                console.error("Error fetching student profile:", error);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    updateStudentProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const studentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { aboutMe, education, interests } = req.body;
                console.log("updateStudentProfile - studentId:", studentId, "body:", req.body);
                if (!studentId) {
                    res.status(constant_1.HTTP_STATUS.UNAUTHORIZED).json({ message: constant_1.ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
                    return;
                }
                if (!aboutMe && !education && (!interests)) {
                    res.status(constant_1.HTTP_STATUS.BAD_REQUEST).json({ message: constant_1.ERROR_MESSAGES.VALIDATION_ERROR });
                    return;
                }
                const profileData = Object.assign(Object.assign(Object.assign({ studentId }, (aboutMe && { aboutMe })), (education && { education })), (interests && { interests }));
                yield this.studentService.updateStudentProfile(studentId, profileData);
                res.status(constant_1.HTTP_STATUS.OK).json({ message: constant_1.SUCCESS_MESSAGES.UPDATE_SUCCESS });
            }
            catch (error) {
                console.error("Error updating student profile:", error);
                const message = error instanceof Error && error.message === constant_1.ERROR_MESSAGES.USER_NOT_FOUND
                    ? error.message
                    : constant_1.ERROR_MESSAGES.SERVER_ERROR;
                const status = message === constant_1.ERROR_MESSAGES.USER_NOT_FOUND
                    ? constant_1.HTTP_STATUS.NOT_FOUND
                    : constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
                res.status(status).json({ message });
            }
        });
    }
    studentDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const studentId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                console.log("addStudentProfile - studentId:", studentId);
                if (!studentId) {
                    res.status(constant_1.HTTP_STATUS.UNAUTHORIZED).json({ message: constant_1.ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
                    return;
                }
                const details = yield this.studentService.getStudentDetails(studentId);
                if (!details) {
                    res.status(constant_1.HTTP_STATUS.NOT_FOUND).json({ message: constant_1.ERROR_MESSAGES.USER_NOT_FOUND });
                    return;
                }
                res.status(constant_1.HTTP_STATUS.OK).json({ message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS, details });
            }
            catch (error) {
                console.error("Error fetching student profile:", error);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
}
exports.StudentController = StudentController;
