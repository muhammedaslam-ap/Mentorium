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
exports.createSecureUrl = void 0;
const cloudinary_1 = require("cloudinary");
const createSecureUrl = (publicId, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("PUBLIC ID", publicId);
        const options = {
            resource_type: `${type}`,
            type: "upload", // Matches the upload type
            sign_url: true, // Ensures the URL is signed
            // secure: true, // U   se HTTPS
        };
        const signedUrl = cloudinary_1.v2.url(publicId, options);
        return signedUrl;
    }
    catch (error) {
        console.error("Error generating signed URL:", error);
        throw new Error("Failed to generate signed URL");
    }
});
exports.createSecureUrl = createSecureUrl;
