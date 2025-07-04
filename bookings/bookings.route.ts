import { Router } from "express";
import { createBooking, deleteBooking, getBookingById, getBookings, updateBooking } from './bookings.controller';
import { adminRoleAuth, bothRoleAuth} from "../middleware/bearAuth";


export const bookingsRouter=Router();

bookingsRouter.get("/bookings", bothRoleAuth,getBookings);
bookingsRouter.get("/bookings/:id", bothRoleAuth,getBookingById);
bookingsRouter.post("/bookings", bothRoleAuth,createBooking);
bookingsRouter.put("/bookings/:id", bothRoleAuth,updateBooking);
bookingsRouter.delete("/bookings/:id",adminRoleAuth,deleteBooking);