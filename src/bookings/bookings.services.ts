import db from "../drizzle/db";
import { bookings, events, TBookingsInsert, TBookingsSelect } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";

//  Create a type that includes booking + relations
type BookingWithRelations = InferSelectModel<typeof bookings> & {
  user: any;
  event: {
    venue: any;
    [key: string]: any;
  };
  payment: any[];
};

//  GET all bookings (optionally filtered by userId)
export const getBookingsService = async (userId?: number) => {
  return await db.query.bookings.findMany({
    where: userId ? eq(bookings.userId, userId) : undefined,
    with: {
      user: true,
      event: true,
      payment: true,
    },
    orderBy: desc(bookings.bookingId),
  });
};

// GET booking by ID (with event + venue, user, and payment)
export const getBookingByIdService = async (id: number): Promise<BookingWithRelations | undefined> => {
  return await db.query.bookings.findFirst({
    where: eq(bookings.bookingId, id),
    with: {
      event: {
        with: {
          venue: true,
        },
      },
      user: true,
      payment: true,
    },
  });
};

//  GET bookings for a specific user (MyBookings)
export const getBookingsByUserService = async (userId: number) => {
  return await db.query.bookings.findMany({
    where: eq(bookings.userId, userId),
    with: {
      event: true,
      payment: true,
    },
    orderBy: desc(bookings.bookingId),
  });
};

// CREATE booking with stock check & price calculation
export const createBookingWithLogic = async ({
  userId,
  eventId,
  quantity,
}: {
  userId: number;
  eventId: number;
  quantity: number;
}): Promise<TBookingsSelect> => {
  // 1. Get event
  const event = await db.query.events.findFirst({
    where: eq(events.eventId, eventId),
  });

  if (!event) throw new Error("Event not found");

  const availableTickets = event.ticketsTotal - (event.ticketsSold ?? 0);
  if (quantity > availableTickets) {
    throw new Error(`Only ${availableTickets} tickets available`);
  }

  // 2. Calculate total price
  const totalAmount = event.ticketPrice * quantity;

  // 3. Insert booking
  const [newBooking] = await db
    .insert(bookings)
    .values({
      userId,
      eventId,
      quantity,
      totalAmount,
      bookingStatus: "Pending",
    })
    .returning(); //  return inserted booking

  // 4. Update event ticket count
  await db
    .update(events)
    .set({ ticketsSold: (event.ticketsSold ?? 0) + quantity })
    .where(eq(events.eventId, eventId));

  return newBooking;
};

// UPDATE booking by ID
export const updateBookingService = async (
  id: number,
  data: Partial<TBookingsInsert>
): Promise<string> => {
  const result = await db
    .update(bookings)
    .set(data)
    .where(eq(bookings.bookingId, id))
    .returning();

  if (result.length === 0) throw new Error("Booking not found");
  return "Booking updated successfully";
};

//  DELETE booking by ID
export const deleteBookingService = async (id: number): Promise<string> => {
  const result = await db
    .delete(bookings)
    .where(eq(bookings.bookingId, id))
    .returning();

  if (result.length === 0) throw new Error("Booking not found");
  return "Booking deleted successfully";
};
