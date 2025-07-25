import { Request, Response } from "express";
import {
  createVenueBookingService,
  getAllVenueBookingsService,
  getVenueBookingsByUserService,
  updateVenueBookingStatusService,
  deleteVenueBookingService,
  checkVenueAvailabilityService,
} from "./venueBooking.service";

//  Create a new venue booking
export const createVenueBooking = async (req: Request, res: Response) => {
  try {
    const bookingData = req.body;
    const newBooking = await createVenueBookingService(bookingData);
    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Venue booking failed:", error);
    res.status(500).json({ message: "Failed to create booking" });
  }
};

//  Get all bookings (admin)
export const getAllVenueBookings = async (_: Request, res: Response) => {
  try {
    const bookings = await getAllVenueBookingsService();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

//  Get bookings by current user
export const getVenueBookingsByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const bookings = await getVenueBookingsByUserService(userId);
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user bookings" });
  }
};

//  Update booking status (admin or logic flow)
export const updateVenueBookingStatus = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const updated = await updateVenueBookingStatusService(Number(bookingId), status);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update booking status" });
  }
};

//  Delete a booking
export const deleteVenueBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const deleted = await deleteVenueBookingService(Number(bookingId));
    res.status(200).json(deleted);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete booking" });
  }
};

// Optional: check for time-slot availability
export const checkVenueAvailability = async (req: Request, res: Response) => {
  try {
    const { venueId, date, startTime, endTime } = req.query;

    const conflicts = await checkVenueAvailabilityService({
      venueId: Number(venueId),
      date: String(date),
      startTime: String(startTime),
      endTime: String(endTime),
    });

    res.status(200).json({ conflicts });
  } catch (error) {
    res.status(500).json({ message: "Failed to check availability" });
  }
};
