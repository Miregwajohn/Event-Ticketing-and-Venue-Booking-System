import { Request, Response } from "express";
import {
  getBookingsService,
  getBookingByIdService,
  createBookingService,
  updateBookingService,
  deleteBookingService,
} from "./bookings.services";

// GET all bookings
export const getBookings = async (_req: Request, res: Response) => {
  try {
    const bookings = await getBookingsService();
    if (!bookings || bookings.length === 0) {
      res.status(404).json({ message: "No bookings found" });
       return;
    }
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch bookings" });
  }
};

// GET booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid booking ID" });
     return;
  }

  try {
    const booking = await getBookingByIdService(id);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
       return;
    }
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch booking" });
  }
};

// CREATE booking
export const createBooking = async (req: Request, res: Response) => {
  const { userId, eventId, quantity, totalAmount, bookingStatus } = req.body;

  if (!userId || !eventId || !quantity || !totalAmount) {
     res.status(400).json({ error: "All required fields must be provided" });
     return;
  }

  try {
    const message = await createBookingService({
      userId,
      eventId,
      quantity,
      totalAmount,
      bookingStatus,
    });

    res.status(201).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create booking" });
  }
};

// UPDATE booking
export const updateBooking = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { userId, eventId, quantity, totalAmount, bookingStatus } = req.body;

  if (isNaN(id)) {
     res.status(400).json({ error: "Invalid booking ID" });
     return;
  }

  if (!userId || !eventId || !quantity || !totalAmount) {
     res.status(400).json({ error: "All fields are required for update" });
     return;
  }

  try {
    const message = await updateBookingService(id, {
      userId,
      eventId,
      quantity,
      totalAmount,
      bookingStatus,
    });

    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update booking" });
  }
};

// DELETE booking
export const deleteBooking = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid booking ID" });
     return;
  }

  try {
    const message = await deleteBookingService(id);
    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete booking" });
  }
};
