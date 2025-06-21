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
exports.StudentRepository = void 0;
const studentProfileModel_1 = require("../models/studentProfileModel");
const userModel_1 = require("../models/userModel");
class StudentRepository {
    createStudentProfile(studentId, studentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newStudentProfileDetails = {
                    studentId,
                    aboutMe: studentData.aboutMe,
                    education: studentData.education,
                    interests: studentData.interests,
                };
                yield studentProfileModel_1.studentProfileModel.create(newStudentProfileDetails);
            }
            catch (error) {
                console.error(`Error creating student profile for studentId: ${studentId}`, error);
                throw error;
            }
        });
    }
    getStudentProfile(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield studentProfileModel_1.studentProfileModel.findOne({ studentId });
            }
            catch (error) {
                console.error(`Error fetching student profile for studentId: ${studentId}`, error);
                throw error;
            }
        });
    }
    getStudentDetails(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield userModel_1.userModel.findById(studentId);
            }
            catch (error) {
                console.error(`Error fetching student profile for studentId: ${studentId}`, error);
                throw error;
            }
        });
    }
    updateStudentProfile(studentId, studentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield studentProfileModel_1.studentProfileModel.updateOne({ studentId }, { $set: Object.assign(Object.assign({}, studentData), { updatedAt: new Date() }) });
                if (result.matchedCount === 0) {
                    throw new Error("Student profile not found");
                }
            }
            catch (error) {
                console.error(`Error updating student profile for studentId: ${studentId}`, error);
                throw error;
            }
        });
    }
}
exports.StudentRepository = StudentRepository;
