import { Request, Response } from "express";
import { initiateSTKPush } from "./mpesa.service";
import { payments, bookings } from "../drizzle/schema";
import db from "../drizzle/db";
import { eq } from "drizzle-orm";

// 🔹 Initiate STK Push for a Booking
export const payForBooking = async (req: Request, res: Response) => {
  const { phone, amount, bookingId } = req.body;

  if (!phone || !amount || !bookingId) {
    return res.status(400).json({ message: "Phone, amount and bookingId are required." });
  }

  try {
    const bookingExists = await db.query.bookings.findFirst({
      where: eq(bookings.bookingId, bookingId),
    });

    if (!bookingExists) {
      return res.status(404).json({ message: `Booking with ID ${bookingId} does not exist.` });
    }

    const result = await initiateSTKPush(phone, amount);
    const checkoutId = result.CheckoutRequestID;

    if (!checkoutId) {
      return res.status(500).json({ message: "Missing CheckoutRequestID from STK push." });
    }

    await db.insert(payments).values({
      bookingId,
      amount,
      checkoutId,
      paymentStatus: "Pending",
      paymentMethod: "M-Pesa",
      createdAt: new Date(),
    });

    return res.status(200).json({
      message: "STK push initiated successfully.",
      data: result,
    });
  } catch (err: any) {
    console.error(" STK Push Error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Payment failed to initiate.",
      error: err.response?.data || err.message,
    });
  }
};

//  Handle M-Pesa Callback from Safaricom
export const mpesaCallbackHandler = async (req: Request, res: Response) => {
  try {
    console.log(" M-Pesa Callback Body:", JSON.stringify(req.body, null, 2));
    const stkCallback = req.body.Body?.stkCallback;

    if (!stkCallback) {
      return res.status(400).json({ message: "Invalid callback format." });
    }

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = stkCallback;

    if (ResultCode !== 0) {
      console.warn(" Payment not successful. ResultCode:", ResultCode);
      return res.status(200).json({ message: "Callback received. Payment not successful." });
    }

    const metadata = new Map<string, any>();
    CallbackMetadata?.Item?.forEach((item: { Name: string; Value: any }) => {
      metadata.set(item.Name, item.Value);
    });

    const amount = metadata.get("Amount");
    const transactionId = metadata.get("MpesaReceiptNumber");

    if (!amount || !transactionId) {
      return res.status(400).json({ message: "Incomplete callback metadata." });
    }

    const payment = await db.query.payments.findFirst({
      where: eq(payments.checkoutId, CheckoutRequestID),
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found." });
    }

    await Promise.all([
      db.update(payments).set({
        transactionId: "ABC123XYZ",
        paymentStatus: "Success",
        paymentDate: new Date(),
      }).where(eq(payments.paymentId, payment.paymentId)),

      db.update(bookings).set({
        bookingStatus: "Paid",
      }).where(eq(bookings.bookingId, payment.bookingId)),
    ]);

    console.log(" Payment confirmation updated:", {
      bookingId: payment.bookingId,
      amount,
      transactionId,
    });

    return res.status(200).json({ message: "Callback processed and payment confirmed." });
  } catch (err: any) {
    console.error("Callback Handler Error:", err.message);
    return res.status(500).json({ message: "Failed to process callback." });
  }
};

// Poll payment status by bookingId
export const getPaymentStatus = async (req: Request, res: Response) => {
  const { bookingId } = req.query;

  if (!bookingId) {
    return res.status(400).json({ message: "Missing bookingId" });
  }

  try {
    const payment = await db.query.payments.findFirst({
      where: eq(payments.bookingId, Number(bookingId)),
    });

    if (!payment) {
      return res.status(404).json({ message: "No payment found for this booking" });
    }

    return res.status(200).json({
      paymentStatus: payment.paymentStatus,
      transactionId: payment.transactionId,
      amount: payment.amount,
    });
  } catch (err: any) {
    console.error(" Status Poll Error:", err.message);
    return res.status(500).json({ message: "Failed to retrieve payment status" });
  }
};

