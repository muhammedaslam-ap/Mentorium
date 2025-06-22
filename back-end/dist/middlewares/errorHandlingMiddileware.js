"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const constant_1 = require("../shared/constant");
const zod_1 = require("zod");
const custom_error_1 = require("../utils/custom.error");
const handleError = (err, req, res, next) => {
    let statusCode = constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = constant_1.ERROR_MESSAGES.SERVER_ERROR;
    let errors;
    console.log('Inside error handler ==>');
    console.error("An error occurred", {
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : "No stack available",
        method: req.method,
        url: req.url,
        ip: req.ip,
        timestamp: new Date().toISOString(),
    });
    // Handle specific error types
    if (err instanceof zod_1.ZodError) {
        statusCode = constant_1.HTTP_STATUS.BAD_REQUEST;
        message = constant_1.ERROR_MESSAGES.VALIDATION_ERROR;
        errors = err.errors.map((e) => ({ message: e.message }));
    }
    else if (err instanceof custom_error_1.CustomError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof Error) {
        statusCode = constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
        message = err.message || constant_1.ERROR_MESSAGES.SERVER_ERROR;
    }
    else {
        statusCode = constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
        message = constant_1.ERROR_MESSAGES.SERVER_ERROR;
    }
    // Send response
    res.status(statusCode).json(Object.assign(Object.assign({ success: false, statusCode,
        message }, (errors && { errors })), (process.env.NODE_ENV === "development" &&
        err instanceof Error && { stack: err.stack })));
    next();
};
exports.handleError = handleError;
