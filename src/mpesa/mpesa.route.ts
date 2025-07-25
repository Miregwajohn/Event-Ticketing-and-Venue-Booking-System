import { Router } from "express";
import { payForBooking, mpesaCallbackHandler  } from "./mpesa.controller";

const mpesaRoutes = Router();

mpesaRoutes.post("/stkpush", payForBooking);
mpesaRoutes.post("/callback", mpesaCallbackHandler);

export default mpesaRoutes;