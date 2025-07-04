import { Request, Response } from "express";
import {
  getSupportTicketsService,
  getSupportTicketByIdService,
  createSupportTicketService,
  updateSupportTicketService,
  deleteSupportTicketService,
} from "./supportTickets.service";

// GET all support tickets
export const getSupportTickets = async (_req: Request, res: Response) => {
  try {
    const tickets = await getSupportTicketsService();
    if (!tickets || tickets.length === 0) {
       res.status(404).json({ message: "No support tickets found" });
       return;
    }
    res.status(200).json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch support tickets" });
  }
};

// GET support ticket by ID
export const getSupportTicketById = async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id);
  if (isNaN(ticketId)) {
    res.status(400).json({ error: "Invalid ticket ID" });
     return;
  }

  try {
    const ticket = await getSupportTicketByIdService(ticketId);
    if (!ticket) {
       res.status(404).json({ message: "Support ticket not found" });
       return;
    }
    res.status(200).json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch support ticket" });
  }
};

// CREATE support ticket
export const createSupportTicket = async (req: Request, res: Response) => {
  const { userId, subject, description, status } = req.body;

  if (!userId || !subject || !description) {
     res.status(400).json({ error: "User ID, subject, and description are required" });
     return;
  }

  try {
    const message = await createSupportTicketService({
      userId,
      subject,
      description,
      status,
    });
    res.status(201).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create support ticket" });
  }
};

// UPDATE support ticket
export const updateSupportTicket = async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id);
  const { userId, subject, description, status } = req.body;

  if (isNaN(ticketId)) {
     res.status(400).json({ error: "Invalid ticket ID" });
     return;
  }

  if (!userId || !subject || !description) {
     res.status(400).json({ error: "User ID, subject, and description are required" });
     return;
  }

  try {
    const message = await updateSupportTicketService(ticketId, {
      userId,
      subject,
      description,
      status,
    });
    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update support ticket" });
  }
};

// DELETE support ticket
export const deleteSupportTicket = async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id);
  if (isNaN(ticketId)) {
     res.status(400).json({ error: "Invalid ticket ID" });
     return;
  }

  try {
    const message = await deleteSupportTicketService(ticketId);
    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete support ticket" });
  }
};
