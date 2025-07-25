import { Router } from "express";
import { createUser, loginUser } from "./auth.controller";
import { rateLimiterMiddleware } from "../middleware/limiters"; 

export const authRouter = Router();

// Register new user
authRouter.post("/auth/register", rateLimiterMiddleware, createUser);

// Login user
authRouter.post("/auth/login", rateLimiterMiddleware, loginUser);
