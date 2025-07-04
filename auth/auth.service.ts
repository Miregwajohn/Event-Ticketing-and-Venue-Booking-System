
import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { users, TUsersInsert, TUsersSelect } from "../drizzle/schema";
    

// Register new user
export const createUserService = async (user: TUsersInsert): Promise<string> => {
  try {
    console.log(" Incoming user payload to insert:", user);
    await db.insert(users).values(user).returning();
    return "User Created Successfully ";
  } catch (error) {
    console.error(" Failed to create user:", error);
    throw error;
  }
}; 

//get user by email
export const getUserByEmailService=async(email:string):Promise<TUsersSelect | undefined>=>{
  return await db.query.users.findFirst({
    where:(eq(users.email,email))
  })
}