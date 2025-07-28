import db from "./db";
import {
  users,
  venues,
  events,
  bookings,
  payments,
  supportTickets,
} from "./schema";

async function seed() {
  console.log("✅ Seeding started...");

    // 1. Users
  await db.insert(users).values([
    {
      userId: 1,
      firstname: "John",
      lastname: "Miregwa",
      email: "john@gmail.com",
      password: "john123",
      contactPhone: "0712345678",
      address: "Nakuru",
      role: "admin",
    },
    {
      userId: 2,
      firstname: "Mary",
      lastname: "Wambui",
      email: "mary@gmail.com",
      password: "mary123",
      contactPhone: "0721345678",
      address: "Mombasa",
      role: "user",
    },
  ]);

  // 2. Venues
  await db.insert(venues).values([
    {
      venueId: 1,
      name: "KICC",
      address: "Harambee Ave, Nairobi",
      capacity: 1000,
    },
    {
      venueId: 2,
      name: "Afraha Stadium",
      address: "Moi Road, Nakuru",
      capacity: 8200,
    },
  ]);

  // 3. Events
  await db.insert(events).values([
    {
      eventId: 1,
      title: "React Conference Kenya",
      description: "Annual React event",
      venueId: 1,
      category: "Tech",
      date: "2025-08-20",
      time: "10:00 AM",
      ticketPrice: 1000,
      ticketsTotal: 100,
      ticketsSold: 0,
          image: "react-conference.jpg",  // Just the filename

    },
    {
      eventId: 2,
      title: "Campus Music Festival",
      description: "Student music event",
      venueId: 2,
      category: "Music",
      date: "2025-09-01",
      time: "06:00 PM",
      ticketPrice: 700,
      ticketsTotal: 80,
      ticketsSold: 0,
      image: "music-event.jpg",  // Just the filename
    },
  ]);

  // 4. Bookings
  await db.insert(bookings).values([
    {
      bookingId: 1,
      userId: 2, // Mary
      eventId: 1, // React Conference
      quantity: 2,
      totalAmount: 2000,
      bookingStatus: "Confirmed",
    },
    {
      bookingId: 2,
      userId: 2,
      eventId: 2, // Music Festival
      quantity: 1,
      totalAmount: 700,
      bookingStatus: "Pending",
    },
  ]);

  // 5. Payments
  await db.insert(payments).values([
    {
      paymentId: 1,
      bookingId: 1,
      amount: 2000,
      paymentStatus: "Paid",
      paymentMethod: "MPesa",
      transactionId: "MPESA123456",
    },
    {
      paymentId: 2,
      bookingId: 2,
      amount: 700,
      paymentStatus: "Pending",
      paymentMethod: "Card",
      transactionId: "CARD789012",
    },
  ]);

  // 6. Support Tickets
await db.insert(supportTickets).values([
  {
    ticketId: 1,
    userId: 2,
    subject: "Booking Error",
    description: "I was charged twice for my ticket.",
    status: "Open",
    caseNumber: "CASE-0001", // ✅ Add this
  },
  {
    ticketId: 2,
    userId: 1,
    subject: "Event not showing",
    description: "The event I created doesn't appear on the dashboard.",
    status: "Resolved",
    caseNumber: "CASE-0002", // ✅ Add this
  },
]);


  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
