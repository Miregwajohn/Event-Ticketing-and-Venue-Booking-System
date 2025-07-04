import  db  from "../drizzle/db";
import { bookings, TBookingsInsert, TBookingsSelect } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// GET all bookings
export const getBookingsService = async (): Promise<TBookingsSelect[]> => {
  return await db.query.bookings.findMany({
    orderBy: desc(bookings.bookingId),
  });
};

// GET booking by ID
export const getBookingByIdService = async (id: number): Promise<TBookingsSelect | undefined> => {
  return await db.query.bookings.findFirst({
    where: eq(bookings.bookingId, id),
  });
};

// CREATE booking

export const createBookingService = async (booking: TBookingsInsert): Promise<string> => {
  try {
    console.log(" Incoming booking payload:", booking);

    await db.insert(bookings).values(booking).returning();

    return "Booking created successfully";
  } catch (error: any) {
    console.error(" Failed to create booking:", error.message || error);
    throw new Error("Booking creation failed: " + error.message);
  }
};
export const updateBookingService = async (id: number, data: TBookingsInsert): Promise<string> => {
  try {
    console.log(" Booking update payload:", data, "ID:", id);

    const result = await db.update(bookings)
      .set(data)
      .where(eq(bookings.bookingId, id))
      .returning();

console.log("Update result from DB:", result);
    if (result.length === 0) {
      throw new Error("No booking found with that ID");
    }

    return "Booking updated successfully";
  } catch (error: any) {
    console.error(" Failed to update booking:", error.message || error);
    throw error;
  }
};


// DELETE booking
export const deleteBookingService = async (id: number): Promise<string> => {
  try {
    console.log("Attempting to delete booking with ID:", id);

    const result = await db.delete(bookings)
      .where(eq(bookings.bookingId, id))
      .returning();

    if (result.length === 0) {
      throw new Error("No booking found with that ID");
    }

    return "Booking deleted successfully";
  } catch (error: any) {
    console.error(" Failed to delete booking:", error.message || error);
    throw new Error("Booking deletion failed: " + error.message);
  }
};

