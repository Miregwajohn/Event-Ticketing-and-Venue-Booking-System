import db from "../drizzle/db";
import { events, venues, TEventsInsert, TEventsSelect } from "../drizzle/schema";
import { eq, ilike, and, gt, desc } from "drizzle-orm";

type Filters = {
  category?: string;
  date?: string;
  address?: string;
  upcomingOnly?: boolean;
};

//  GET all events with optional filters
export const getEventsService = async (filters: Filters = {}): Promise<TEventsSelect[]> => {
  const baseConditions = [];

  if (filters.category) {
    baseConditions.push(eq(events.category, filters.category));
  }

  if (filters.date) {
    baseConditions.push(eq(events.date, filters.date));
  }

  if (filters.upcomingOnly) {
    const today = new Date().toISOString().split("T")[0];
    baseConditions.push(gt(events.date, today));
  }

  //  Build query with join to venues table
  const results = await db
    .select()
    .from(events)
    .leftJoin(venues, eq(events.venueId, venues.venueId))
    .where(
      and(
        ...baseConditions,
        ...(filters.address && filters.address.length > 1
          ? [ilike(venues.address, `%${filters.address}%`)]
          : [])
      )
    )
    .orderBy(desc(events.eventId));

  //  Flatten result to match TEventsSelect[]
  return results.map((row) => ({
    ...row.events,
    venue: row.venues,
  }));
};


//  GET single event by ID or Slug
export const getEventByIdService = async (idOrSlug: number | string): Promise<TEventsSelect | undefined> => {
  const isNumeric = typeof idOrSlug === "number" || /^\d+$/.test(idOrSlug.toString());

  if (isNumeric) {
    return await db.query.events.findFirst({
      where: eq(events.eventId, Number(idOrSlug)),
      with: {
        venue: true,
      },
    });
  }

  return await db.query.events.findFirst({
    where: eq(events.slug, idOrSlug.toString()),
    with: {
      venue: true,
    },
  });
};


//  CREATE event
export const createEventService = async (event: TEventsInsert): Promise<string> => {
  try {
    console.log("Incoming event payload to insert:", event);
    await db.insert(events).values(event).returning();
    return "Event created successfully!";
  } catch (error: any) {
    console.error("Failed to create event:", error.message || error);
    throw new Error("Event creation failed: " + error.message);
  }
};

//  UPDATE event
export const updateEventService = async (id: number, data: TEventsInsert): Promise<string> => {
  try {
    console.log("Event update payload:", data, "ID:", id);
    const result = await db
      .update(events)
      .set(data)
      .where(eq(events.eventId, id))
      .returning();

    if (result.length === 0) {
      throw new Error("No event found with that ID");
    }

    return "Event updated successfully";
  } catch (error: any) {
    console.error("Failed to update event:", error.message || error);
    throw new Error("Event update failed: " + error.message);
  }
};

//  DELETE event
export const deleteEventService = async (id: number): Promise<string> => {
  try {
    console.log("Attempting to delete event with ID:", id);
    const result = await db
      .delete(events)
      .where(eq(events.eventId, id))
      .returning();

    if (result.length === 0) {
      throw new Error("No event found with that ID");
    }

    return "Event deleted successfully";
  } catch (error: any) {
    console.error("Failed to delete event:", error.message || error);
    throw new Error("Event deletion failed: " + error.message);
  }
};
