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
exports.UserRepository = void 0;
const mongoose_1 = require("mongoose");
const baseRepository_1 = require("./baseRepository");
const userModel_1 = require("../models/userModel");
const tutorProfileModel_1 = require("../models/tutorProfileModel");
class UserRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(userModel_1.userModel);
    }
    createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.create(data);
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne({ email });
        });
    }
    resetPassword(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updated = yield this.model.findOneAndUpdate({ email: data.email }, { password: data.newPassword }, { new: true });
            return !!updated;
        });
    }
    updatePassword(id, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const updated = yield this.model.findByIdAndUpdate(id, { password: newPassword }, { new: true });
            return !!updated;
        });
    }
    findByIdWithProfile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!mongoose_1.Types.ObjectId.isValid(id))
                return null;
            const user = yield this.model
                .aggregate([
                { $match: { _id: new mongoose_1.Types.ObjectId(id) } },
                {
                    $lookup: {
                        from: "userprofiles",
                        localField: "_id",
                        foreignField: "userId",
                        as: "userProfile",
                    },
                },
                { $unwind: { path: "$userProfile", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        password: 1,
                        role: 1,
                        isBlocked: 1,
                        isAccepted: 1,
                        "userProfile.education": 1,
                        "userProfile.aboutMe": 1,
                        "userProfile.interests": 1,
                    },
                },
            ])
                .exec();
            if (!user || user.length === 0)
                return null;
            const userData = user[0];
            return {
                name: userData.name,
                email: userData.email,
                password: userData.password || null,
                role: userData.role || "student",
                isBlocked: userData.isBlocked || false,
                isAccepted: userData.isAccepted || false,
                education: ((_a = userData.userProfile) === null || _a === void 0 ? void 0 : _a.education) || "",
                aboutMe: ((_b = userData.userProfile) === null || _b === void 0 ? void 0 : _b.aboutMe) || "",
                interests: ((_c = userData.userProfile) === null || _c === void 0 ? void 0 : _c.interests) || "",
            };
        });
    }
    acceptTutor(tutorId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.findByIdAndUpdate(tutorId, { isAccepted: true });
            yield tutorProfileModel_1.tutorProfileModel.updateOne({ tutorId }, { approvalStatus: "approved" });
        });
    }
    updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.findByIdAndUpdate(id, { isBlocked: status });
        });
    }
    getUsers(_a) {
        return __awaiter(this, arguments, void 0, function* ({ page, pageSize, search, role, }) {
            const query = {};
            if (role)
                query.role = role;
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ];
            }
            const skip = (page - 1) * pageSize;
            const users = yield this.model
                .aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: "tutorprofiles",
                        localField: "_id",
                        foreignField: "tutorId",
                        as: "tutorProfile",
                    },
                },
                {
                    $unwind: { path: "$tutorProfile", preserveNullAndEmptyArrays: true },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        role: 1,
                        isBlocked: 1,
                        isAccepted: 1,
                        lastActive: 1,
                        "tutorProfile.specialization": 1,
                        "tutorProfile.verificationDocUrl": 1,
                        "tutorProfile.approvalStatus": 1,
                        "tutorProfile.phone": 1,
                        "tutorProfile.bio": 1,
                    },
                },
                { $skip: skip },
                { $limit: pageSize },
            ])
                .exec();
            const total = yield this.model.countDocuments(query);
            const totalPages = Math.ceil(total / pageSize);
            const flattenedUsers = users.map((user) => {
                var _a, _b, _c, _d, _e;
                return ({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isBlocked: user.isBlocked || false,
                    isAccepted: user.isAccepted || false,
                    specialization: ((_a = user.tutorProfile) === null || _a === void 0 ? void 0 : _a.specialization) || "",
                    verificationDocUrl: ((_b = user.tutorProfile) === null || _b === void 0 ? void 0 : _b.verificationDocUrl) || "",
                    approvalStatus: ((_c = user.tutorProfile) === null || _c === void 0 ? void 0 : _c.approvalStatus) || "pending",
                    phone: ((_d = user.tutorProfile) === null || _d === void 0 ? void 0 : _d.phone) || "",
                    bio: ((_e = user.tutorProfile) === null || _e === void 0 ? void 0 : _e.bio) || "",
                });
            });
            return { data: flattenedUsers, total, page, pageSize, totalPages };
        });
    }
}
exports.UserRepository = UserRepository;
