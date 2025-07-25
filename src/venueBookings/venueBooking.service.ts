import  db  from "../drizzle/db";
import { venueBookings, venues, users } from "../drizzle/schema";
import { sql, eq, and } from "drizzle-orm";

//  Create a new venue booking
export const createVenueBookingService = async (bookingData: {
  userId: number;
  venueId: number;
  eventTitle: string;
  date: string;        
  startTime: string;   
  endTime: string;    
}) => {
  return await db.insert(venueBookings).values(bookingData).returning();
};

// Get all bookings (admin/global use)
export const getAllVenueBookingsService = async () => {
  return await db.select().from(venueBookings);
};

//  Get bookings for a specific user with venue info
export const getVenueBookingsByUserService = async (userId: number) => {
  return await db
    .select({
      venueBookingId: venueBookings.venueBookingId,
      eventTitle: venueBookings.eventTitle,
      date: venueBookings.date,
      startTime: venueBookings.startTime,
      endTime: venueBookings.endTime,
      status: venueBookings.status,
      venue: {
        venueId: venues.venueId,
        name: venues.name,
        address: venues.address,
        pricePerHour: venues.pricePerHour,
      },
    })
    .from(venueBookings)
    .innerJoin(venues, eq(venueBookings.venueId, venues.venueId))
    .where(eq(venueBookings.userId, userId));
};

//  Update booking status (e.g. Confirm or Cancel)
export const updateVenueBookingStatusService = async (
  bookingId: number,
  status: string
) => {
  return await db
    .update(venueBookings)
    .set({ status })
    .where(eq(venueBookings.venueBookingId, bookingId))
    .returning();
};

// Delete a booking
export const deleteVenueBookingService = async (bookingId: number) => {
  return await db
    .delete(venueBookings)
    .where(eq(venueBookings.venueBookingId, bookingId))
    .returning();
};

// Check for booking conflicts on same date & time
export const checkVenueAvailabilityService = async ({
  venueId,
  date,
  startTime,
  endTime,
}: {
  venueId: number;
  date: string;
  startTime: string;
  endTime: string;
}) => {
  return await db
    .select()
    .from(venueBookings)
    .where(
      and(
        eq(venueBookings.venueId, venueId),
        eq(venueBookings.date, date),
        sql`${venueBookings.startTime} < ${endTime}`,
        sql`${venueBookings.endTime} > ${startTime}`
      )
    );
};
