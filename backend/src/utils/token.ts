import jwt, { SignOptions } from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY as string;
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY as string;

/**
 * Generate access token (short-lived)
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_ACCESS_EXPIRY as any,
  };
  return jwt.sign(payload, JWT_ACCESS_SECRET, options);
};

/**
 * Generate refresh token (long-lived)
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRY as any,
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (
  payload: TokenPayload,
): { accessToken: string; refreshToken: string } => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): DecodedToken => {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): DecodedToken => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

/**
 * Decode token without verification (for debugging/utility)
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwt.decode(token) as DecodedToken | null;
    return decoded;
  } catch (error) {
    return null;
  }
};
