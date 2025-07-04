import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ENUMS
export const roleEnum = pgEnum("role", ["user", "admin"]);

// TABLES 

// 1. Users
export const users = pgTable("users", {
  userId: serial("user_id").primaryKey(),
  firstname: varchar("firstname", { length: 100 }).notNull(),
  lastname: varchar("lastname", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }),
  address: text("address"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 2. Venues
export const venues = pgTable("venues", {
  venueId: serial("venue_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  address: text("address").notNull(),
  capacity: integer("capacity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 3. Events
export const events = pgTable("events", {
  eventId: serial("event_id").primaryKey(),
  title: varchar("title", { length: 150 }).notNull(),
  description: text("description"),
  venueId: integer("venue_id")
    .references(() => venues.venueId, { onDelete: "cascade" })
    .notNull(),
  category: varchar("category", { length: 100 }),
  date: varchar("date", { length: 50 }).notNull(),
  time: varchar("time", { length: 50 }).notNull(),
  ticketPrice: integer("ticket_price").notNull(),
  ticketsTotal: integer("tickets_total").notNull(),
  ticketsSold: integer("tickets_sold").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 4. Bookings
export const bookings = pgTable("bookings", {
  bookingId: serial("booking_id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.userId, { onDelete: "cascade" })
    .notNull(),
  eventId: integer("event_id")
    .references(() => events.eventId, { onDelete: "cascade" })
    .notNull(),
  quantity: integer("quantity").notNull(),
  totalAmount: integer("total_amount").notNull(),
  bookingStatus: varchar("booking_status", { length: 50 }).default("Pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 5. Payments
export const payments = pgTable("payments", {
  paymentId: serial("payment_id").primaryKey(),
  bookingId: integer("booking_id")
    .references(() => bookings.bookingId, { onDelete: "cascade" })
    .notNull(),
  amount: integer("amount").notNull(),
  paymentStatus: varchar("payment_status", { length: 50 }).default("Pending"),
  paymentDate: timestamp("payment_date", { withTimezone: true }).defaultNow(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 6. Support Tickets
export const supportTickets = pgTable("support_tickets", {
  ticketId: serial("ticket_id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.userId, { onDelete: "cascade" })
    .notNull(),
  subject: varchar("subject", { length: 150 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 }).default("Open"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});


// RELATIONS

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  supportTickets: many(supportTickets),
}));

export const venuesRelations = relations(venues, ({ many }) => ({
  events: many(events),
}));

export const eventsRelations = relations(events, ({ many, one }) => ({
  venue: one(venues, { fields: [events.venueId], references: [venues.venueId] }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.userId] }),
  event: one(events, { fields: [bookings.eventId], references: [events.eventId] }),
  payment: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.bookingId] }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, { fields: [supportTickets.userId], references: [users.userId] }),
}));

// TYPES

export type TUsersInsert = typeof users.$inferInsert;
export type TUsersSelect = typeof users.$inferSelect;

export type TVenuesInsert = typeof venues.$inferInsert;
export type TVenuesSelect = typeof venues.$inferSelect;

export type TEventsInsert = typeof events.$inferInsert;
export type TEventsSelect = typeof events.$inferSelect;

export type TBookingsInsert = typeof bookings.$inferInsert;
export type TBookingsSelect = typeof bookings.$inferSelect;

export type TPaymentsInsert = typeof payments.$inferInsert;
export type TPaymentsSelect = typeof payments.$inferSelect;

export type TSupportTicketsInsert = typeof supportTickets.$inferInsert;
export type TSupportTicketsSelect = typeof supportTickets.$inferSelect;
