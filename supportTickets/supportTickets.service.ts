import  db  from "../drizzle/db";
import {
  supportTickets,
  TSupportTicketsInsert,
  TSupportTicketsSelect,
} from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// GET all support tickets
export const getSupportTicketsService = async (): Promise<TSupportTicketsSelect[]> => {
  return await db.query.supportTickets.findMany({
    orderBy: desc(supportTickets.ticketId),
  });
};

// GET support ticket by ID
export const getSupportTicketByIdService = async (id: number): Promise<TSupportTicketsSelect | undefined> => {
  return await db.query.supportTickets.findFirst({
    where: eq(supportTickets.ticketId, id),
  });
};

// CREATE support ticket
export const createSupportTicketService = async (data: TSupportTicketsInsert): Promise<string> => {
  try {
    console.log(" Creating support ticket with payload:", data);
    await db.insert(supportTickets).values(data).returning();
    return "Support ticket created successfully";
  } catch (error: any) {
    console.error(" Failed to create support ticket:", error.message || error);
    throw new Error("Support ticket creation failed: " + error.message);
  }
};

// UPDATE support ticket
export const updateSupportTicketService = async (id: number, data: TSupportTicketsInsert): Promise<string> => {
  try {
    console.log("Updating support ticket ID:", id, "with data:", data);

    const result = await db
      .update(supportTickets)
      .set(data)
      .where(eq(supportTickets.ticketId, id))
      .returning();

    if (result.length === 0) {
      throw new Error("No support ticket found with that ID");
    }

    return "Support ticket updated successfully";
  } catch (error: any) {
    console.error("Failed to update support ticket:", error.message || error);
    throw new Error("Support ticket update failed: " + error.message);
  }
};

// DELETE support ticket
export const deleteSupportTicketService = async (id: number): Promise<string> => {
  try {
    console.log(" Deleting support ticket with ID:", id);

    const result = await db
      .delete(supportTickets)
      .where(eq(supportTickets.ticketId, id))
      .returning();

    if (result.length === 0) {
      throw new Error("No support ticket found with that ID");
    }

    return "Support ticket deleted successfully";
  } catch (error: any) {
    console.error("Failed to delete support ticket:", error.message || error);
    throw new Error("Support ticket deletion failed: " + error.message);
  }
};