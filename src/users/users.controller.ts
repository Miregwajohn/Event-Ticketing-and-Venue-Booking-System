import { Request, Response } from "express";
import {
  getUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  deleteUserService,
} from "./users.services";

// GET all users
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await getUsersService();
    if (!users || users.length === 0) {
     res.status(404).json({ message: "No users found" });
      return ;
    }
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch users" });
  }
};

// GET current user 
export const getCurrentUserProfile = async (req: Request, res: Response) => {
  try {
    console.log("Decoded user from token:", req.user);

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await getUserByIdService(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

   return res.status(200).json(user);
  } catch (error: any) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ error: "Failed to fetch current user" });
  }
};

// GET user by ID
export const getUserById = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return ;
  }

  try {
    const user = await getUserByIdService(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return ;
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch user" });
  }
};

// CREATE new user
export const createUser = async (req: Request, res: Response) => {
  const { firstname, lastname, email, password, contactPhone, address, role } = req.body;

  if (!firstname || !lastname || !email || !password || !role) {
    res.status(400).json({ error: "All required user fields must be provided" });
     return;
  }

  try {
    const message = await createUserService({
      firstname,
      lastname,
      email,
      password,
      contactPhone,
      address,
      role,
    });
    res.status(201).json({ message });
  } catch (error: any) {
    if (error.message.includes("unique")) {
       res.status(409).json({ error: "Email already exists" });
       return;
    }
    res.status(500).json({ error: error.message || "Failed to create user" });
  }
};

// UPDATE user (supports partial updates )
export const updateUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const allowedFields = [
    "firstname", "lastname", "email", "password",
    "contactPhone", "address", //omit role, is_active from frontend updates
  ];

  const updateData: Record<string, any> = {};
  for (const key of Object.keys(req.body)) {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  try {
    await updateUserService(userId, updateData); // no need to capture message

    // ✅ Re-fetch full user for Redux hydration
    const updatedUser = await getUserByIdService(userId);

    return res.status(200).json(updatedUser); // ✅ return flat user object
  } catch (error: any) {
    console.error("Update error:", error);
    return res.status(500).json({ error: error.message || "Failed to update user" });
  }
};



// DELETE user
export const deleteUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
     res.status(400).json({ error: "Invalid user ID" });
     return;
  }

  try {
    const message = await deleteUserService(userId);
    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete user" });
  }
};
