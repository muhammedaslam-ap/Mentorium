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
exports.AdminService = void 0;
class AdminService {
    constructor(_userRepository, _tutorRepository) {
        this._userRepository = _userRepository;
        this._tutorRepository = _tutorRepository;
    }
    acceptTutor(tutorId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._userRepository.acceptTutor(tutorId);
        });
    }
    updateRejectedReason(id, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._tutorRepository.updateRejectedReason(id, reason);
        });
    }
    usersList(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, pageSize, search, role } = options;
            const { data, total } = yield this._userRepository.getUsers({
                page,
                pageSize,
                search,
                role,
            });
            return {
                data,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            };
        });
    }
    updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._userRepository.updateStatus(id, status);
        });
    }
}
exports.AdminService = AdminService;
