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
exports.PurchaseService = void 0;
class PurchaseService {
    constructor(_purchaseRepository) {
        this._purchaseRepository = _purchaseRepository;
    }
    saveOrder(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._purchaseRepository.saveOrder(userId, data);
        });
    }
    checkEnrollment(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId || !courseId) {
                throw new Error("userId or courseId is undefined");
            }
            return yield this._purchaseRepository.isEnrolled(userId, courseId);
        });
    }
    getUserEnrolledCourses(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._purchaseRepository.getEnrolledCourses(userId);
        });
    }
    getPurchaseHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._purchaseRepository.getPurchaseHistory(userId);
        });
    }
}
exports.PurchaseService = PurchaseService;
