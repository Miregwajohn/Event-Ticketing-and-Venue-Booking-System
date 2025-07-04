import { Router } from "express";
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from "./payment.controller";

export const paymentRouter = Router();

paymentRouter.get("/payments", getPayments);
paymentRouter.get("/payments/:id", getPaymentById);
paymentRouter.post("/payments", createPayment);
paymentRouter.put("/payments/:id", updatePayment);
paymentRouter.delete("/payments/:id", deletePayment);
//bothRoleAuth,  all