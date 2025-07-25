import { Request, Response } from "express";
import {
  getSupportTicketsService,
  getSupportTicketByIdService,
  getSupportTicketsByUserService,
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

// GET support ticket for currentUser
export const getCurrentUserSupportTickets = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized: Missing userId" });

  try {
    const tickets = await getSupportTicketsByUserService(userId);
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ message: "No support tickets found for user" });
    }

    res.status(200).json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch support tickets" });
  }
};


// CREATE support ticket
export const createSupportTicket = async (req: Request, res: Response) => {
  const { subject, description, status } = req.body;
  const userId = req.user?.userId;

  if (!userId || !subject || !description) {
    return res.status(400).json({ error: "User ID, subject, and description are required" });
  }

  try {
    // Optional: enforce one open ticket per user
    // const existing = await db.supportTickets.findFirst({
    //   where: { userId, status: "Open" },
    // });
    // if (existing) {
    //   return res.status(409).json({ error: "You already have an open ticket." });
    // }

    // Generate unique case number
    const caseNumber = `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

    const message = await createSupportTicketService({
      userId,
      subject,
      description,
      status,
      caseNumber,
    });

    res.status(201).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create support ticket" });
  }
};


// UPDATE support ticket
export const updateSupportTicket = async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id);
  if (isNaN(ticketId)) {
    return res.status(400).json({ error: "Invalid ticket ID" });
  }

  const allowedFields = ["userId", "subject", "description", "status"];
  const updateData: Record<string, any> = {};

  for (const key of Object.keys(req.body)) {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  try {
    const message = await updateSupportTicketService(ticketId, updateData);
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
