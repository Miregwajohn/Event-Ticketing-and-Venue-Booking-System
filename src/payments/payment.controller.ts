import { Request, Response } from "express";
import {
  getPaymentsService,
  getPaymentByIdService,
  getPaymentsByUserService,
  createPaymentService,
  updatePaymentService,
  deletePaymentService,
} from "./payments.service";

// GET all payments
export const getPayments = async (_req: Request, res: Response) => {

  try {
    const payments = await getPaymentsService();
    if (!payments || payments.length === 0) {
       res.status(404).json({ message: "No payments found" });
       return;
    }
    res.status(200).json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch payments" });
  }
};

// GET payment by ID
export const getPaymentById = async (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.id);
  if (isNaN(paymentId)) {
     res.status(400).json({ error: "Invalid payment ID" });
     return;
  }

  try {
    const payment = await getPaymentByIdService(paymentId);
    if (!payment) {
       res.status(404).json({ message: "Payment not found" });
       return;
    }
    res.status(200).json(payment);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch payment" });
  }
};


// GET payments for current logged-in user
export const getCurrentUserPayments = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  console.log("✔️ Hitting getCurrentUserPayments for userId:", userId);

  if (!userId) {
    console.warn(" Missing userId in request");
    return res.status(401).json({ error: "Unauthorized: Missing userId" });
  }

  try {
    const payments = await getPaymentsByUserService(userId);

    if (!payments || payments.length === 0) {
      console.log(`ℹ No payments found for userId: ${userId}`);
      return res.status(404).json({ message: "No payments found for user" });
    }

    res.status(200).json(payments);
  } catch (error: any) {
    console.error(" Error fetching user payments:", error);
    res.status(500).json({
      error: error.message || "Failed to fetch user payments",
    });
  }
};


// CREATE payment
export const createPayment = async (req: Request, res: Response) => {
  const { bookingId, amount, paymentStatus, paymentMethod, transactionId } = req.body;

  if (!bookingId || !amount) {
    res.status(400).json({ error: "Booking ID and amount are required" });
     return;
  }

  try {
    const message = await createPaymentService({
      bookingId,
      amount,
      paymentStatus,
      paymentMethod,
      transactionId,
    });

    res.status(201).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create payment" });
  }
};

// UPDATE payment
export const updatePayment = async (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.id);

  if (isNaN(paymentId)) {
    return res.status(400).json({ error: "Invalid payment ID" });
  }

  const allowedFields = [
    "bookingId",
    "amount",
    "paymentStatus",
    "paymentMethod",
    "transactionId",
  ];
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
    const message = await updatePaymentService(paymentId, updateData);
    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update payment" });
  }
};


// DELETE payment
export const deletePayment = async (req: Request, res: Response) => {
  const paymentId = parseInt(req.params.id);

  if (isNaN(paymentId)) {
     res.status(400).json({ error: "Invalid payment ID" });
     return;
  }

  try {
    const message = await deletePaymentService(paymentId);
    res.status(200).json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete payment" });
  }
};
