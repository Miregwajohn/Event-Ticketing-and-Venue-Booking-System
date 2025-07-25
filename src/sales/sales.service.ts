import db from "../drizzle/db";
import { bookings, events, payments } from "../drizzle/schema";
import { eq, sum, count, desc } from "drizzle-orm";

export const getSalesData = async () => {
  // 1. Get total revenue from confirmed payments
  const revenueResult = await db
    .select({ totalRevenue: sum(payments.amount).mapWith(Number) })
    .from(payments)
    .where(eq(payments.paymentStatus, "Confirmed"));
  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  // 2. Get total bookings with confirmed payments
  const bookingsResult = await db
    .select({ totalBookings: count() })
    .from(payments)
    .where(eq(payments.paymentStatus, "Confirmed"));
  const totalBookings = bookingsResult[0]?.totalBookings || 0;

  // 3. Get top 5 events by tickets sold from confirmed bookings
  const topEvents = await db
    .select({
      eventId: events.eventId,
      title: events.title,
      ticketsSold: bookings.quantity,
    })
    .from(bookings)
    .innerJoin(events, eq(bookings.eventId, events.eventId))
    .innerJoin(payments, eq(bookings.bookingId, payments.bookingId))
    .where(eq(payments.paymentStatus, "Confirmed"))
    .orderBy(desc(bookings.quantity))
    .limit(5);

  return {
    totalRevenue,
    totalBookings,
    topEvents,
  };
};
