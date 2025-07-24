import { Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
  accessTokenName: string,
  refreshTokenName: string
) => {
  res.cookie(accessTokenName, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax", 
    path: "/",
    maxAge:  2 * 60 * 60 * 1000 , 
  });

  res.cookie(refreshTokenName, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const updateCookieWithAccessToken = (
  res: Response,
  accessToken: string,
  accessTokenName: string
) => {
  res.cookie(accessTokenName, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 1 * 60 * 1000,
  });
};

export const clearAuthCookies = (
  res: Response,
  accessTokenName: string,
  refreshTokenName: string
) => {
  res.clearCookie(accessTokenName, { path: "/" });
  res.clearCookie(refreshTokenName, { path: "/" });
};
