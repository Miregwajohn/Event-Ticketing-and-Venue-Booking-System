import Jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

type DecodedToken = {
  userId: number;
  email: string;
  role: string;
  firstname: string;
  lastname: string;
  exp: number;
};

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

// 🔐 Utility: Token Verifier
export const verifyToken = async (token: string, secret: string): Promise<DecodedToken | null> => {
  try {
    const decoded = Jwt.verify(token, secret) as DecodedToken;
    return decoded;
  } catch (error: any) {
    console.error("JWT verification error:", error.name || error.message);
    return null;
  }
};

// 🔐 Role-Based Middleware
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
  requiredRoles: string
) => {
  const rawHeader = req.header("Authorization");

  if (!rawHeader) {
    console.warn("Missing Authorization header");
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const token = rawHeader.startsWith("Bearer ") ? rawHeader.slice(7) : rawHeader;

  if (!token || token.length < 10) {
    console.warn("Malformed or empty token");
    return res.status(401).json({ error: "Invalid or malformed token" });
  }

  const decodedToken = await verifyToken(token, process.env.JWT_SECRET as string);

  if (!decodedToken) {
    console.warn("Invalid or expired token:", token);
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const role = decodedToken.role;
  const authorized =
    requiredRoles === "both"
      ? role === "admin" || role === "user"
      : role === requiredRoles;

  if (!authorized) {
    console.warn(`Forbidden access attempt by ${role}`);
    return res.status(403).json({ error: "Forbidden: insufficient permissions" });
  }

  req.user = decodedToken;
  next();
};

// 🔐 Exported role guards
export const adminRoleAuth = async (req: Request, res: Response, next: NextFunction) =>
  await authMiddleware(req, res, next, "admin");

export const userRoleAuth = async (req: Request, res: Response, next: NextFunction) =>
  await authMiddleware(req, res, next, "user");

export const bothRoleAuth = async (req: Request, res: Response, next: NextFunction) =>
  await authMiddleware(req, res, next, "both");
