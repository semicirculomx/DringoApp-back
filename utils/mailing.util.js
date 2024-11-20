import { createTransport } from "nodemailer";

// Load email credentials from environment variables
const { SMTP_EMAIL, SMTP_PASSWORD, SMTP_HOST, SMTP_PORT } = process.env;

async function sendEmail(data) {
  try {
    // Configure Nodemailer transporter
    const transport = createTransport({
      host: SMTP_HOST, // SMTP server
      port: Number(SMTP_PORT), // SMTP port
      secure: true, // Use SSL/TLS for port 465
      auth: {
        user: SMTP_EMAIL, // Email username
        pass: SMTP_PASSWORD, // Email password
      },
    });

    // Verify the SMTP connection
    await transport.verify();
    console.log("SMTP connection verified successfully.");

    // Send the email
    await transport.sendMail({
      from: `"Dringo App" <${SMTP_EMAIL}>`, // Sender's name and email
      to: data.to, // Recipient's email address
      subject: data.subject, // Email subject
      html: data.template, // HTML email body
    });

    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export default sendEmail;