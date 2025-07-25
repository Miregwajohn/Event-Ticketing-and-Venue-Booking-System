import express, { Application, Response } from "express";
import dotenv from "dotenv";
import { userRouter } from "./users/users.routes";
import { venueRouter } from "./venues/venues.route";
import { eventRouter } from "./events/events.route";
import { bookingsRouter } from "./bookings/bookings.route";
import { paymentRouter } from "./payments/payment.route";
import { supportTicketRouter } from "./supportTickets/supportTickets.routes";
import { authRouter } from "./auth/auth.route";
import { logger } from "./middleware/logger";
import { rateLimiterMiddleware } from "./middleware/limiters";
import cors from "cors"
import salesRoutes from "./sales/sales.routes";
import mpesaRoutes from "./mpesa/mpesa.route";


dotenv.config();

const app: Application = express();

// Enable CORS
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true               
}));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Rate Limiter Middleware
app.use(rateLimiterMiddleware);

// Default route
app.get("/", (req, res: Response) => {
  res.send("Welcome to Event Ticketing API using Drizzle ORM and Neon");
});



// import  routes
app.use("/api",userRouter)
app.use("/api",venueRouter)
app.use("/api",eventRouter)
app.use("/api",bookingsRouter)
app.use("/api",paymentRouter)
app.use("/api",supportTicketRouter)
app.use("/api",authRouter)
app.use("/api", salesRoutes);
app.use("/api/mpesa", mpesaRoutes); 





app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
