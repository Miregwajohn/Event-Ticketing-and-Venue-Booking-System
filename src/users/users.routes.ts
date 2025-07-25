import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUserProfile, // ✅ import new controller
} from "./users.controller";

import { adminRoleAuth, bothRoleAuth } from "../middleware/bearAuth";

export const userRouter = Router();

// ✅ GET current logged-in user from token
userRouter.get("/users/me", bothRoleAuth, getCurrentUserProfile);

// GET all users
userRouter.get("/users", getUsers);

// GET user by ID
userRouter.get("/users/:id", getUserById);

// CREATE new user
userRouter.post("/users", createUser);

// UPDATE user by ID
userRouter.put("/users/:id", bothRoleAuth, updateUser);

// DELETE user by ID
userRouter.delete("/users/:id", adminRoleAuth, deleteUser);
