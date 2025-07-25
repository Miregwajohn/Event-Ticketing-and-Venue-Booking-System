import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { createUserService, getUserByEmailService } from './auth.service';
import { sendNotificationEmail } from '../middleware/googlemailer';

// Register a new user
export const createUser = async (req: Request, res: Response) => {
  const user = req.body;
  console.log("🚀 created user ~ user:", user);

  try {
    //  Validate required fields
    if (!user.firstname || !user.lastname || !user.email || !user.password) {
      res.status(400).json({ error: "All required user fields must be provided" });
      return;
    }

    //  Check if email already exists
    const existingUser = await getUserByEmailService(user.email);
    if (existingUser) {
      res.status(409).json({ error: "Email already exists" });
      return;
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(user.password, salt);
    user.password = hashedPassword;

    // Create user
    const newUser = await createUserService(user);

    //  Remove password from response
    const { password, ...safeUser } = newUser;

    //  Send welcome email
    await sendNotificationEmail(
      user.email,
      user.firstname,
      "Welcome to Event Ticketing and Venue Booking System 🎉",
      `Hi ${user.firstname}, your account was created successfully.`
    );

    //  Respond success
    res.status(201).json({
      message: "User registered successfully",
      user: safeUser,
    });

  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message || "Failed to create user" });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
  const user = req.body;

  try {
    const existingUser = await getUserByEmailService(user.email);
    if (!existingUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    //  Compare passwords
    const isMatch = bcrypt.compareSync(user.password, existingUser.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    //  Generate JWT
    const payload = {
      userId: existingUser.userId,
      email: existingUser.email,
      firstname: existingUser.firstname,
      lastname: existingUser.lastname,
      role: existingUser.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiry
    };

    const secret = process.env.JWT_SECRET as string;
    const token = jwt.sign(payload, secret);

    // Return success response
   res.status(200).json({
  token,
  user: {
    userId: existingUser.userId,
    email: existingUser.email,
    firstname: existingUser.firstname,
    lastname: existingUser.lastname,
    role: existingUser.role,
    contactPhone: existingUser.contactPhone,
    address: existingUser.address,
    createdAt: existingUser.createdAt,
  },
  message: "Login successful",
});


  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message || "Failed to login" });
  }
};
