import { Request, Response } from "express";
import {
  createVenueService,
  deleteVenueService,
  getVenueByIdService,
  getVenuesService,
  updateVenueService
} from "./venues.service";

//  GET all venues
export const getVenues = async (_req: Request, res: Response) => {
  try {
    const venues = await getVenuesService();
    if (!venues || venues.length === 0) {
      res.status(404).json({ message: "No venues found" });
    } else {
      res.status(200).json(venues);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch venues" });
  }
};

// GET venue by ID
export const getVenueById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid venue ID" });
    return;
  }

  try {
    const venue = await getVenueByIdService(id);
    if (!venue) {
      res.status(404).json({ message: "Venue not found" });
    } else {
      res.status(200).json(venue);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch venue" });
  }
};

//  CREATE new venue
export const createVenue = async (req: Request, res: Response) => {
  const { name, address, capacity } = req.body;

  if (!name || !address || !capacity) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const result = await createVenueService({ name, address, capacity });
    if (!result) {
      res.status(500).json({ message: "Failed to create venue" });
    } else {
      res.status(201).json({ message: "Venue created successfully" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create venue" });
  }
};

// UPDATE venue
export const updateVenue = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, address, capacity } = req.body;

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid venue ID" });
    return;
  }

  if (!name || !address || !capacity) {
    res.status(400).json({ error: "All fields are required for update" });
    return;
  }

  try {
    const result = await updateVenueService(id, { name, address, capacity });
    if (!result) {
      res.status(404).json({ message: "Venue not found or failed to update" });
    } else {
      res.status(200).json({ message: "Venue updated successfully" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update venue" });
  }
};

//  DELETE venue
export const deleteVenue = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid venue ID" });
    return;
  }

  try {
    const result = await deleteVenueService(id);
    if (result) {
      res.status(200).json({ message: "Venue deleted successfully" });
    } else {
      res.status(404).json({ message: "Venue not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete venue" });
  }
};
