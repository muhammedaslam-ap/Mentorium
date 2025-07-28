"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.updateCookieWithAccessToken = exports.setAuthCookies = void 0;
const isProduction = process.env.NODE_ENV === "production";
const setAuthCookies = (res, accessToken, refreshToken, accessTokenName, refreshTokenName) => {
    res.cookie(accessTokenName, accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 2 * 60 * 60 * 1000,
    });
    res.cookie(refreshTokenName, refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};
exports.setAuthCookies = setAuthCookies;
const updateCookieWithAccessToken = (res, accessToken, accessTokenName) => {
    res.cookie(accessTokenName, accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 1 * 60 * 1000,
    });
};
exports.updateCookieWithAccessToken = updateCookieWithAccessToken;
const clearAuthCookies = (res, accessTokenName, refreshTokenName) => {
    res.clearCookie(accessTokenName, { path: "/" });
    res.clearCookie(refreshTokenName, { path: "/" });
};
exports.clearAuthCookies = clearAuthCookies;
