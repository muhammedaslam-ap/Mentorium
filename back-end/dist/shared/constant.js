"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = exports.SUCCESS_MESSAGES = exports.HTTP_STATUS = void 0;
var HTTP_STATUS;
(function (HTTP_STATUS) {
    HTTP_STATUS[HTTP_STATUS["OK"] = 200] = "OK";
    HTTP_STATUS[HTTP_STATUS["CREATED"] = 201] = "CREATED";
    HTTP_STATUS[HTTP_STATUS["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HTTP_STATUS[HTTP_STATUS["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HTTP_STATUS[HTTP_STATUS["FORBIDDEN"] = 403] = "FORBIDDEN";
    HTTP_STATUS[HTTP_STATUS["NOT_FOUND"] = 404] = "NOT_FOUND";
    HTTP_STATUS[HTTP_STATUS["CONFLICT"] = 409] = "CONFLICT";
    HTTP_STATUS[HTTP_STATUS["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HTTP_STATUS[HTTP_STATUS["GONE"] = 410] = "GONE";
})(HTTP_STATUS || (exports.HTTP_STATUS = HTTP_STATUS = {}));
;
exports.SUCCESS_MESSAGES = {
    OPERATION_SUCCESS: "Opearation Succesfull",
    CREATED: "Created successfully.",
    LOGIN_SUCCESS: "Login successful.",
    REGISTRATION_SUCCESS: "Registration completed successfully.",
    OTP_SEND_SUCCESS: "OTP sent successfully",
    LOGOUT_SUCCESS: "Logged out successfully.",
    UPDATE_SUCCESS: "Updated successfully.",
    DELETE_SUCCESS: "Deleted successfully.",
    PASSWORD_RESET_SUCCESS: "Password reset successfully.",
    VERIFICATION_SUCCESS: "Verification completed successfully.",
    DATA_RETRIEVED_SUCCESS: "Data fetched successfully",
    ADDED_WHISHLIST: "Item added to whishlist",
    ALREADY_WISHLIST: "Item alredy in wishlist",
    REMOVED_WHISHLIST: "Item removed from wishlist"
};
exports.ERROR_MESSAGES = {
    ADMIN_BLOCKED: "Account is Blocked by admin",
    ADMIN_DONOT_ACCEPTED: "Admin Must Verify First",
    OTP_SEND_FAILED: "OTP sent failed",
    OTP_INVALID: "Invalid OTP",
    OTP_EXPIRED: "OTP has Expired",
    INVALID_ROLE: "Invalid user role",
    UNAUTH_NO_USER_FOUND: "Unauthorized: No user found in request",
    INCOMPLETE_INFO: "Incomplete information.",
    ID_REQUIRED: "ID required",
    TOKEN_EXPIRED: "Token Expired",
    EMAIL_NOT_FOUND: "Email Not Found",
    FORBIDDEN: "Access denied. You do not have permission to access this resource.",
    BLOCKED: "Your account has been blocked.",
    NOT_ALLOWED: "You are not allowed",
    EMAIL_EXISTS: "Email Already Exists",
    INVALID_TOKEN: "Invalid token",
    INVALID_CREDENTIALS: "Invalid credentials provided.",
    USER_NOT_FOUND: "User not found.",
    CREATE_USER_PROFILE: "Create User Profile",
    UNAUTHORIZED_ACCESS: "Unauthorized access.",
    SERVER_ERROR: "An error occurred, please try again later.",
    VALIDATION_ERROR: "Validation error occurred.",
    MISSING_PARAMETERS: "Missing required parameters.",
    ROUTE_NOT_FOUND: "Route not found.",
    ID_NOT_PROVIDED: "ID not provided",
    INVALID_PASSWORD: "Password Doesnot Match",
    GOOGLE_USER: "This user is an google auth user no password change is possible"
};
