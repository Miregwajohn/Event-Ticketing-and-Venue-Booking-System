import { Router } from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./events.controller";
import { adminRoleAuth, bothRoleAuth } from "../middleware/bearAuth";

export const eventRouter = Router();

eventRouter.get("/events", getEvents);
eventRouter.get("/events/:id", getEventById);
eventRouter.post("/events",adminRoleAuth, createEvent);
eventRouter.put("/events/:id", adminRoleAuth,  updateEvent);
eventRouter.delete("/events/:id", adminRoleAuth, deleteEvent);
