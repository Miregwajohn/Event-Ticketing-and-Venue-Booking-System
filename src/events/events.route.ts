import { Router } from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventBySlug,
} from "./events.controller";
import { adminRoleAuth} from "../middleware/bearAuth";

export const eventRouter = Router();

//  Slug route MUST come before /:id to avoid conflicts
eventRouter.get("/events/slug/:slug", getEventBySlug);

eventRouter.get("/events", getEvents);
eventRouter.get("/events/:id", getEventById);
eventRouter.post("/events",adminRoleAuth, createEvent);
eventRouter.put("/events/:id", adminRoleAuth,  updateEvent);
eventRouter.delete("/events/:id", adminRoleAuth, deleteEvent);
