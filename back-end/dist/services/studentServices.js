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
exports.StudentService = void 0;
class StudentService {
    constructor(studentRepository) {
        this.studentRepository = studentRepository;
    }
    addStudentProfile(studentId, profileData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!studentId || !profileData) {
                    throw new Error("Student ID and profile data are required");
                }
                if (!profileData.aboutMe || !profileData.education || !profileData.interests) {
                    throw new Error("aboutMe, education, and interests are required in profile data");
                }
                const existingProfile = yield this.studentRepository.getStudentProfile(studentId);
                if (existingProfile) {
                    throw new Error("Student profile already exists");
                }
                yield this.studentRepository.createStudentProfile(studentId, profileData);
            }
            catch (error) {
                console.error(`Error adding student profile for studentId: ${studentId}`, error);
                throw error instanceof Error ? error : new Error("Failed to add student profile");
            }
        });
    }
    updateStudentProfile(studentId, profileData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!studentId || !profileData) {
                    throw new Error("Student ID and profile data are required");
                }
                const existingProfile = yield this.studentRepository.getStudentProfile(studentId);
                if (!existingProfile) {
                    throw new Error("Student profile not found");
                }
                yield this.studentRepository.updateStudentProfile(studentId, profileData);
            }
            catch (error) {
                console.error(`Error updating student profile for studentId: ${studentId}`, error);
                throw error instanceof Error ? error : new Error("Failed to update student profile");
            }
        });
    }
    getStudentDetails(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!studentId) {
                    throw new Error("Student ID is required");
                }
                const studentDetails = yield this.studentRepository.getStudentDetails(studentId);
                return studentDetails;
            }
            catch (error) {
                console.error(`Error fetching student profile for studentId: ${studentId}`, error);
                throw error instanceof Error ? error : new Error("Failed to fetch student profile");
            }
        });
    }
    getStudentProfile(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!studentId) {
                    throw new Error("Student ID is required");
                }
                const profile = yield this.studentRepository.getStudentProfile(studentId);
                return profile;
            }
            catch (error) {
                console.error(`Error fetching student profile for studentId: ${studentId}`, error);
                throw error instanceof Error ? error : new Error("Failed to fetch student profile");
            }
        });
    }
}
exports.StudentService = StudentService;
