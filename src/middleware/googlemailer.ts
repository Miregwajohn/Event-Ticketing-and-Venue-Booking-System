import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendNotificationEmail = async (
  email: string,
  firstname: string,
  subject: string,
  message: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      secure: true,
      auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Event Ticketing" <${process.env.EMAIL_SENDER}>`,
      to: email,
      subject: subject,
      text: `Hi ${firstname},\n${message}`,
      html: `
        <html>
          <head>
            <style>
              .email-container {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                padding: 20px;
                border-radius: 5px;
              }
              .btn {
                padding: 10px 20px;
                background-color: #28a745;
                color: white;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <h2>${subject}</h2>
              <p>Hello ${firstname},</p>
              <p>${message}</p>
              <p>Enjoy our services!</p>
            </div>
          </body>
        </html>
      `,
    };

    const mailRes = await transporter.sendMail(mailOptions);

    if (mailRes.accepted.includes(email)) {
      return "Notification email sent successfully";
    } else if (mailRes.rejected.length > 0) {
      return "Notification email not sent, please try again";
    } else {
      return "Email server error";
    }
  } catch (error) {
    console.error("Email send error:", error);
    return "Email server error";
  }
};
