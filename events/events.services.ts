import  db  from "../drizzle/db";
import { events, TEventsInsert, TEventsSelect } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// GET all events
export const getEventsService = async (): Promise<TEventsSelect[]> => {
  return await db.query.events.findMany({
    orderBy: desc(events.eventId),
  });
};

// GET event by ID
export const getEventByIdService = async (id: number): Promise<TEventsSelect | undefined> => {
  return await db.query.events.findFirst({
    where: eq(events.eventId, id),
  });
};

// CREATE new event
export const createEventService = async (event: TEventsInsert): Promise<string> => {
  try {
    console.log("Incoming event payload to insert:", event);
    await db.insert(events).values(event).returning();
    return "Event created successfully!";
  } catch (error) {
    console.error(" Failed to create event:", error);
    throw error;
  }
};
// UPDATE event
export const updateEventService = async (id: number, data: TEventsInsert): Promise<string> => {
  try {
    console.log("Event update payload:", data, "ID:", id);

    const result = await db.update(events)
      .set(data)
      .where(eq(events.eventId, id))
      .returning();

    if (result.length === 0) {
      throw new Error("No event found with that ID");
    }

    return "Event updated successfully";
  } catch (error: any) {
    console.error(" Failed to update event:", error.message || error);
    throw new Error("Event update failed: " + error.message);
  }
};

// DELETE event
export const deleteEventService = async (id: number): Promise<string> => {
  try {
    console.log("Attempting to delete event with ID:", id);

    const result = await db.delete(events)
      .where(eq(events.eventId, id))
      .returning();

    if (result.length === 0) {
      throw new Error("No event found with that ID");
    }

    return "Event deleted successfully";
  } catch (error: any) {
    console.error(" Failed to delete event:", error.message || error);
    throw new Error("Event deletion failed: " + error.message);
  }
};

