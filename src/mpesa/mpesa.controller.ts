import { Request, Response } from "express";
import { initiateSTKPush } from "./mpesa.service";
import { payments, bookings } from "../drizzle/schema";
import db from "../drizzle/db";
import { eq } from "drizzle-orm";

// Temporary in-memory mapping of CheckoutRequestID → bookingId
export const pendingPayments: Record<string, number> = {};

export const payForBooking = async (req: Request, res: Response) => {
  const { phone, amount, bookingId } = req.body;

  if (!phone || !amount || !bookingId) {
    return res.status(400).json({ message: "Phone, amount and bookingId are required." });
  }

  try {
    // ✅ Confirm booking ID exists before proceeding
    const bookingExists = await db.query.bookings.findFirst({
      where: eq(bookings.bookingId, bookingId),
    });

    if (!bookingExists) {
      return res.status(404).json({ message: `Booking with ID ${bookingId} does not exist.` });
    }

    const formattedPhone = phone.startsWith("254") ? phone : phone.replace(/^0/, "254");
    const result = await initiateSTKPush(formattedPhone, amount);

    const checkoutId = result.CheckoutRequestID;
    if (checkoutId) {
      pendingPayments[checkoutId] = bookingId;
    }

    return res.status(200).json({
      message: "STK push initiated successfully.",
      data: result,
    });
  } catch (err: any) {
    console.error("STK Push Error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Payment failed to initiate.",
      error: err.response?.data || err.message,
    });
  }
};
   //Handle call back
export const mpesaCallbackHandler = async (req: Request, res: Response) => {
  try {
    console.log("M-Pesa Callback Body:", JSON.stringify(req.body, null, 2));

    const stkCallback = req.body.Body?.stkCallback;
    if (!stkCallback) {
      return res.status(400).json({ message: "Invalid callback format" });
    }

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = stkCallback;

    if (ResultCode !== 0) {
      console.warn("Payment failed or cancelled. ResultCode:", ResultCode);
      return res.status(200).json({ message: "Callback received. Payment not successful." });
    }

    const bookingId = pendingPayments[CheckoutRequestID];
    if (!bookingId) {
      console.warn("Booking ID not found for CheckoutRequestID:", CheckoutRequestID);
      return res.status(400).json({ message: "Missing or invalid booking reference." });
    }

    let amount: number | undefined;
    let transactionId: string | undefined;

    if (CallbackMetadata?.Item) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === "Amount") amount = item.Value;
        if (item.Name === "MpesaReceiptNumber") transactionId = item.Value;
      }
    }

    if (!amount || !transactionId) {
      console.error("Missing required transaction details from callback");
      return res.status(400).json({ message: "Incomplete callback metadata." });
    }

    try {
      await db.insert(payments).values({
        bookingId,
        amount,
        transactionId,
        paymentStatus: "Success",
        paymentMethod: "M-Pesa",
      });
    } catch (dbErr: any) {
      console.error("Database Insert Error:", dbErr.message);
      return res.status(500).json({
        message: "Failed to store payment in database.",
        error: dbErr.message,
      });
    }

    delete pendingPayments[CheckoutRequestID];
    return res.status(200).json({ message: "Callback processed and payment stored." });
  } catch (err: any) {
    console.error("Callback Handler Error:", err.message);
    return res.status(500).json({ message: "Failed to process callback." });
  }
};
