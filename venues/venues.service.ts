import db from "../drizzle/db";
import { venues, TVenuesInsert, TVenuesSelect } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// GET all venues
export const getVenuesService = async (): Promise<TVenuesSelect[]> => {
  return await db.query.venues.findMany({
    orderBy: desc(venues.venueId),
  });
};

// GET venue by ID
export const getVenueByIdService = async (id: number): Promise<TVenuesSelect | undefined> => {
  return await db.query.venues.findFirst({
    where: eq(venues.venueId, id),
  });
};


// CREATE new venue
export const createVenueService = async (venue: TVenuesInsert): Promise<string> => {
  try {
    console.log(" Incoming venue payload to insert:", venue);
    await db.insert(venues).values(venue).returning();
    return "Venue Created Successfully ";
  } catch (error) {
    console.error(" Failed to create user:", error);
    throw error;
  }
};

// UPDATE venue
export const updateVenueService = async (id: number, data: TVenuesInsert): Promise<string> => {
  try {
    console.log("Venue update payload:", data, "ID:", id);

    const result = await db.update(venues)
      .set(data)
      .where(eq(venues.venueId, id))
      .returning();

    if (result.length === 0) {
      throw new Error("No venue found with that ID");
    }

    return "Venue updated successfully";
  } catch (error: any) {
    console.error(" Failed to update venue:", error.message || error);
    throw new Error("Venue update failed: " + error.message);
  }
};

// DELETE venue
export const deleteVenueService = async (id: number): Promise<string> => {
  try {
    console.log("Attempting to delete venue with ID:", id);

    const result = await db.delete(venues)
      .where(eq(venues.venueId, id))
      .returning();

    if (result.length === 0) {
      throw new Error("No venue found with that ID");
    }

    return "Venue deleted successfully";
  } catch (error: any) {
    console.error("Failed to delete venue:", error.message || error);
    throw new Error("Venue deletion failed: " + error.message);
  }
};
