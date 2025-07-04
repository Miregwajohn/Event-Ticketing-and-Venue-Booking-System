import { eq } from "drizzle-orm";
import db from "../drizzle/db"
import { TUsersInsert,TUsersSelect,users } from "../drizzle/schema";
import { desc } from "drizzle-orm";



//CRUD Operations for User entity

//GET all users
export const getUsersService = async (): Promise<TUsersSelect[]> => {
  return await db.query.users.findMany({
    orderBy: desc(users.userId),
  });
};

//GET user by Id
export const getUserByIdService = async (id: number): Promise<TUsersSelect | undefined> => {
  return await db.query.users.findFirst({
    where: eq(users.userId, id),
  });
};

//Create a user
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


// UPDATE user
export const updateUserService = async (id: number, user: TUsersInsert): Promise<string> => {
  try {
    console.log("User update payload:", user, "ID:", id);

    const result = await db.update(users)
      .set(user)
      .where(eq(users.userId, id))
      .returning();

    if (result.length === 0) {
      throw new Error("No user found with that ID");
    }

    return "User updated successfully";
  } catch (error: any) {
    console.error("Failed to update user:", error.message || error);
    throw new Error("User update failed: " + error.message);
  }
};

// DELETE user
export const deleteUserService = async (id: number): Promise<string> => {
  try {
    console.log("Attempting to delete user with ID:", id);

    const result = await db.delete(users)
      .where(eq(users.userId, id))
      .returning();

    if (result.length === 0) {
      throw new Error("No user found with that ID");
    }

    return "User deleted successfully";
  } catch (error: any) {
    console.error("Failed to delete user:", error.message || error);
    throw new Error("User deletion failed: " + error.message);
  }
};
