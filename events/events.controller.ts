import { Request, Response } from "express";
import {
  getEventsService,
  getEventByIdService,
  createEventService,
  updateEventService,
  deleteEventService,
} from "./events.services";

// GET all events
export const getEvents = async (_req: Request, res: Response) => {
  try {
    const events = await getEventsService();
    if (!events || events.length === 0) {
     res.status(404).json({ message: "No events found" });
      return ;
    }
    res.status(200).json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch events" });
  }
};

// GET event by ID
export const getEventById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
     res.status(400).json({ error: "Invalid event ID" });
     return;
  }

  try {
    const event = await getEventByIdService(id);
    if (!event) {
       res.status(404).json({ message: "Event not found" });
       return
    }
    res.status(200).json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch event" });
  }
};

// CREATE event
export const createEvent = async (req: Request, res: Response) => {
  const {
    title,
    description,
    venueId,
    category,
    date,
    time,
    ticketPrice,
    ticketsTotal,
  } = req.body;

  if (!title || !venueId || !date || !time || !ticketPrice || !ticketsTotal) {
     res.status(400).json({ error: "All required event fields must be provided" });

     
      }

  try {
    const message = await createEventService({
      title,
      description,
      venueId,
      category,
      date,
      time,
      ticketPrice,
      ticketsTotal,
    });

    res.status(201).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create event" });
  }
};

// UPDATE event
export const updateEvent = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const {
    title,
    description,
    venueId,
    category,
    date,
    time,
    ticketPrice,
    ticketsTotal,
    ticketsSold,
  } = req.body;

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid event ID" });
     return;
  }

  if (!title || !venueId || !date || !time || !ticketPrice || !ticketsTotal) {
    res.status(400).json({ error: "All required fields must be provided for update" });
     return;
  }

  try {
    const message = await updateEventService(id, {
      title,
      description,
      venueId,
      category,
      date,
      time,
      ticketPrice,
      ticketsTotal,
      ticketsSold,
    });

    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update event" });
  }
};

// DELETE event
export const deleteEvent = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid event ID" });
     return;
  }

  try {
    const message = await deleteEventService(id);
    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete event" });
  }
};
