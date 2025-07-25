import express from "express";
import {
  createVenueBooking,
  getAllVenueBookings,
  getVenueBookingsByUser,
  updateVenueBookingStatus,
  deleteVenueBooking,
  checkVenueAvailability,
} from "./venueBooking.controller";
import { bothRoleAuth } from "../middleware/bearAuth"; 

const router = express.Router();
router.post("/bookings", bothRoleAuth, createVenueBooking);
router.get("/bookings", getAllVenueBookings);
router.get("/bookings/me", bothRoleAuth, getVenueBookingsByUser);
router.put("/bookings/:bookingId/status", updateVenueBookingStatus);
router.delete("/bookings/:bookingId", bothRoleAuth, deleteVenueBooking);

//  Check time-slot conflicts for a venue
router.get("/availability", checkVenueAvailability);

export default router;
