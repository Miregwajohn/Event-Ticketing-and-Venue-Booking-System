import { Request, Response } from "express";
import slugify from "slugify";
import {
  getEventsService,
  getEventByIdService,
  createEventService,
  updateEventService,
  deleteEventService,
} from "./events.services";

// GET all events with optional filters
export const getEvents = async (req: Request, res: Response) => {
  try {
    const { category, date, address, upcomingOnly } = req.query;

    const filters = {
      category: typeof category === "string" ? category : undefined,
      date: typeof date === "string" ? date : undefined,
      address: typeof address === "string" ? address : undefined,
      upcomingOnly: upcomingOnly === "true",
    };

    const events = await getEventsService(filters);

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

// GET event by slug
export const getEventBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({ error: "Slug is required" });
  }

  try {
    const event = await getEventByIdService(slug); // We’ll enhance this to accept either ID or slug
    if (!event) {
      return res.status(404).json({ message: "Event not found by slug" });
    }

    res.status(200).json(event);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch event by slug" });
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
    image,
  } = req.body;

  if (
    !title ||
    !venueId ||
    !date ||
    !time ||
    !ticketPrice ||
    !ticketsTotal ||
    !image
  ) {
    return res
      .status(400)
      .json({ error: "All required event fields must be provided" });
  }

  try {
    // ✅ Generate a slug automatically from title and date (for uniqueness)
    const baseSlug = slugify(title, { lower: true, strict: true });
    const slug = `${baseSlug}-${Date.now()}`;

    const message = await createEventService({
      title,
      description,
      venueId,
      category,
      date,
      time,
      ticketPrice,
      ticketsTotal,
      image,
      slug, // ✅ Include the generated slug
    });

    res.status(201).json({ message });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to create event" });
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
    image,
  } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid event ID" });
  }

  if (
    !title ||
    !venueId ||
    !date ||
    !time ||
    !ticketPrice ||
    !ticketsTotal ||
    !image
  ) {
    return res
      .status(400)
      .json({ error: "All required fields must be provided for update" });
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
      image,
    });

    res.status(200).json({ message });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to update event" });
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
