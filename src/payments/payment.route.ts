import { Router } from "express";
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getCurrentUserPayments,
} from "./payment.controller";
import { bothRoleAuth } from "../middleware/bearAuth";


export const paymentRouter = Router();

paymentRouter.get("/payments/me", bothRoleAuth, getCurrentUserPayments); 
paymentRouter.get("/payments", getPayments);
paymentRouter.get("/payments/:id", getPaymentById);
paymentRouter.post("/payments", createPayment);
paymentRouter.put("/payments/:id", updatePayment);
paymentRouter.delete("/payments/:id", deletePayment);
