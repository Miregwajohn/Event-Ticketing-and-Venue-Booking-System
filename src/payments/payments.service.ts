import db from "../drizzle/db";
import { payments,bookings, events ,TPaymentsInsert, TPaymentsSelect } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

//  GET all payments 
export const getPaymentsService = async () => {
  return await db.query.payments.findMany({
    with: {
      booking: {
        with: {
          user: true,
          event: true,
        },
      },
    },
    orderBy: desc(payments.paymentId),
  });
};

// GET payment by ID
export const getPaymentByIdService = async (id: number): Promise<TPaymentsSelect | undefined> => {
  return await db.query.payments.findFirst({
    where: eq(payments.paymentId, id),
  });
};


// Get payments for current logged-in user
export const getPaymentsByUserService = async (userId: number) => {
  return await db
    .select({
      paymentId: payments.paymentId,
      amount: payments.amount,
      paymentStatus: payments.paymentStatus,
      paymentDate: payments.paymentDate,
      paymentMethod: payments.paymentMethod,
      transactionId: payments.transactionId,
      createdAt: payments.createdAt,
      updatedAt: payments.updatedAt,
      booking: {
        bookingId: bookings.bookingId,
        totalAmount: bookings.totalAmount,
        bookingStatus: bookings.bookingStatus,
      },
      event: {
        title: events.title,
        date: events.date,
        time: events.time,
        venueId: events.venueId,
        ticketPrice: events.ticketPrice,
      },
    })
    .from(payments)
    .innerJoin(bookings, eq(payments.bookingId, bookings.bookingId))
    .innerJoin(events, eq(bookings.eventId, events.eventId))
    .where(eq(bookings.userId, userId))
    .orderBy(desc(payments.paymentId));
};


// CREATE payment
export const createPaymentService = async (data: TPaymentsInsert): Promise<string> => {
  try {
    console.log("Incoming payment payload:", data);

    await db.insert(payments).values(data).returning();

    return "Payment recorded successfully";
  } catch (error: any) {
    console.error("Failed to create payment:", error.message || error);
    throw new Error("Payment creation failed: " + error.message);
  }
};

// UPDATE payment
export const updatePaymentService = async (
  id: number,
  data: Partial<TPaymentsInsert>
): Promise<string> => {
  try {
    console.log("Payment update payload:", data, "ID:", id);

    const result = await db
      .update(payments)
      .set(data)
      .where(eq(payments.paymentId, id))
      .returning();

    if (result.length === 0) {
      throw new Error("No payment found with that ID");
    }

    return "Payment updated successfully";
  } catch (error: any) {
    console.error("Failed to update payment:", error.message || error);
    throw new Error("Payment update failed: " + error.message);
  }
};

// DELETE payment
export const deletePaymentService = async (id: number): Promise<string> => {
  try {
    console.log("Deleting payment ID:", id);

    const result = await db.delete(payments)
      .where(eq(payments.paymentId, id))
      .returning();

    if (result.length === 0) {
      throw new Error("No payment found with that ID");
    }

    return "Payment deleted successfully";
  } catch (error: any) {
    console.error("Failed to delete payment:", error.message || error);
    throw new Error("Payment deletion failed: " + error.message);
  }
};
