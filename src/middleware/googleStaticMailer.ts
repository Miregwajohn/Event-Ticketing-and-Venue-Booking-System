import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  secure: true,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Simple hard-coded test email to verify setup
transporter.sendMail(
  {
    from: `"Event Ticketing App" <${process.env.EMAIL_SENDER}>`,
    to: "Johnmire@gmail.com",
    subject: "Test Email from Event App",
    text: "Hello from your Gmail mailer setup!",
  },
  (err, info) => {
    if (err) return console.error("Email error:", err);
    console.log("✅ Test email sent:", info.response);
  }
);
