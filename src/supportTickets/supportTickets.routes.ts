import { Router } from "express";
import {
  getSupportTickets,
  getCurrentUserSupportTickets,
  getSupportTicketById,
  createSupportTicket,
  updateSupportTicket,
  deleteSupportTicket,
} from "./supportTickets.controller";
import { adminRoleAuth, bothRoleAuth } from "../middleware/bearAuth";

export const supportTicketRouter = Router();

supportTicketRouter.get("/support-tickets/me", bothRoleAuth, getCurrentUserSupportTickets); // 👈 insert this FIRST
supportTicketRouter.get("/support-tickets", getSupportTickets);
supportTicketRouter.get("/support-tickets/:id", bothRoleAuth, getSupportTicketById);
supportTicketRouter.post("/support-tickets", bothRoleAuth, createSupportTicket);
supportTicketRouter.put("/support-tickets/:id", bothRoleAuth, updateSupportTicket);
supportTicketRouter.delete("/support-tickets/:id", adminRoleAuth, deleteSupportTicket);


