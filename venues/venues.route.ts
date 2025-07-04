import { Router } from "express";
import { createVenue, deleteVenue, getVenueById, getVenues, updateVenue } from "./venues.controller";
import { adminRoleAuth } from "../middleware/bearAuth";



export const venueRouter=Router();

venueRouter.get("/venues",getVenues);
venueRouter.get("/venues/:id",getVenueById);
venueRouter.post("/venues",adminRoleAuth,createVenue);
venueRouter.put("/venues/:id",adminRoleAuth,updateVenue);
venueRouter.delete("/venues/:id",adminRoleAuth,deleteVenue);