"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withoutRoleRegisterSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Register DTO schema
exports.registerSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(3, "Name is required")
        .max(50, "Name must be 50 charecter or less"),
    email: zod_1.z.string().email("Invalid email address").min(3, "Email is required"),
    password: zod_1.z
        .string()
        .min(8, "Password must be atleast 8 charecters")
        .regex(/[A-Za-z]/, "Password must contain at least one letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .optional(),
    role: zod_1.z.string(),
    isBlocked: zod_1.z.boolean().optional().default(false),
    isAccepted: zod_1.z.boolean().optional().default(false),
});
exports.withoutRoleRegisterSchema = exports.registerSchema.omit({ role: true });
