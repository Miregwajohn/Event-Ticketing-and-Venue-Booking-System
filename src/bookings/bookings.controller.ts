import { Request, Response } from "express";
import {
  getBookingsService,
  getBookingByIdService,
  getBookingsByUserService, 
  createBookingWithLogic,
  updateBookingService,
  deleteBookingService,
} from "./bookings.services";




// GET all bookings
export const getBookings = async (_req: Request, res: Response) => {
  try {
    const bookings = await getBookingsService();

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    //  Log each booking and its payments
    bookings.forEach((b) => {
      console.log("Booking ID:", b.bookingId, "Payments:", b.payment);
    });

    const formatted = bookings.map((b) => ({
      bookingId: b.bookingId,
      quantity: b.quantity,
      totalAmount: b.totalAmount,
      bookingStatus: b.bookingStatus,
      createdAt: b.createdAt,
      userName: `${b.user.firstname} ${b.user.lastname}`,
      userEmail: b.user.email,
      eventTitle: b.event.title,
      eventDate: b.event.date,
      paymentId: b.payment?.[0]?.paymentId,
      paymentMethod: b.payment?.[0]?.paymentMethod || "—",
      paymentStatus: b.payment?.[0]?.paymentStatus || "Pending",
    }));

    res.status(200).json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch bookings" });
  }
};


// GET booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid booking ID" });

  try {
    const booking = await getBookingByIdService(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({
  ...booking,
  paymentStatus: booking.payment?.[0]?.paymentStatus || "Pending",
});

  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch booking" });
  }
};

// GET bookings for current logged-in user

export const getCurrentUserBookings = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    console.warn("Missing userId in token payload");
    return res.status(401).json({ error: "Unauthorized: Missing userId" });
  }

  try {
    console.log("Decoded userId:", userId);

    const bookings = await getBookingsByUserService(userId);

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found for user" });
    }

    const formatted = bookings.map((b) => ({
      bookingId: b.bookingId,
      quantity: b.quantity,
      totalAmount: b.totalAmount,
      bookingStatus: b.bookingStatus,
      createdAt: b.createdAt,
      eventTitle: b.event.title,
      eventDate: b.event.date,
      paymentMethod: b.payment?.[0]?.paymentMethod || "—",
      paymentStatus: b.payment?.[0]?.paymentStatus || "Pending",
    }));

    res.status(200).json(formatted);
  } catch (error: any) {
    console.error("Error fetching user bookings:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch user bookings" });
  }
};


// CREATE booking 
export const createBooking = async (req: Request, res: Response) => {
  const { userId, eventId, quantity } = req.body;

  if (!userId || !eventId || !quantity) {
    return res.status(400).json({ error: "userId, eventId, and quantity are required" });
  }

  try {
    const booking = await createBookingWithLogic({ userId, eventId, quantity });

    res.status(201).json({
      message: "Booking successful",
      bookingId: booking.bookingId, //  include the bookingId
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create booking" });
  }
};


// UPDATE booking
export const updateBooking = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid booking ID" });

  const allowedFields = ["userId", "eventId", "quantity", "totalAmount", "bookingStatus"];
  const updateData: Record<string, any> = {};

  for (const key of Object.keys(req.body)) {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  try {
    const message = await updateBookingService(id, updateData);
    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update booking" });
  }
};

// DELETE booking
export const deleteBooking = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid booking ID" });

  try {
    const message = await deleteBookingService(id);
    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete booking" });
  }
};
