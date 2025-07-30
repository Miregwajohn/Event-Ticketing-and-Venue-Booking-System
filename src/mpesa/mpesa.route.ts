import { Router } from "express";
import {
  payForBooking,
  mpesaCallbackHandler,
  getPaymentStatus 
} from "./mpesa.controller";

const mpesaRoutes = Router();

mpesaRoutes.post("/stkpush", payForBooking);
mpesaRoutes.post("/callback", mpesaCallbackHandler);
mpesaRoutes.get("/status", getPaymentStatus); // Enables frontend polling

export default mpesaRoutes;
