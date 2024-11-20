import { createTransport } from "nodemailer";
import dotenv from "dotenv";

// Load environment variables (optional for better security)
dotenv.config();

const { SMTP_EMAIL, SMTP_PASSWORD, SMTP_HOST, SMTP_PORT } = process.env;

async function sendEmail(data) {
  try {
    const transport = createTransport({
      host: SMTP_HOST, // SMTP server host
      port: Number(SMTP_PORT), // SMTP server port
      secure: true, // Use SSL for port 465
      auth: {
        user: SMTP_EMAIL, // Email address
        pass: SMTP_PASSWORD, // Email password
      },
    });

    // Verify the SMTP connection
    await transport.verify();
    console.log("SMTP connection verified successfully.");

    // Send the email
    await transport.sendMail({
      from: `"Dringo App" <${SMTP_EMAIL}>`, // Sender address
      to: data.to, // Recipient address
      subject: data.subject, // Email subject
      html: data.template, // Email body in HTML format
    });

    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export default sendEmail;