import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { users, TUsersInsert, TUsersSelect } from "../drizzle/schema";

//  Register new user and return the full user object
export const createUserService = async (
  user: TUsersInsert
): Promise<TUsersSelect> => {
  try {
    console.log("🚀 Incoming user payload to insert:", user);

    //  Insert and return the newly created user
    const [newUser] = await db.insert(users).values(user).returning();

    return newUser;
  } catch (error) {
    console.error("❌ Failed to create user:", error);
    throw error;
  }
};

//  Get user by email
export const getUserByEmailService = async (
  email: string
): Promise<TUsersSelect | undefined> => {
  return await db.query.users.findFirst({
    where: eq(users.email, email),
  });
};
