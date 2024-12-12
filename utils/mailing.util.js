import { createTransport } from "nodemailer";

// Load email credentials from environment variables
const { SMTP_EMAIL, SMTP_PASSWORD, DOMAIN_EMAIL, DOMAIN_PASSWORD, SMTP_HOST, SMTP_PORT } = process.env;

// Create a primary transport for Google's SMTP
const googleTransport = createTransport({
  host: SMTP_HOST, // SMTP server
  port: Number(SMTP_PORT),
  secure: true, // Use SSL
  auth: {
    user: SMTP_EMAIL, // Your Google email
    pass: SMTP_PASSWORD, // Your App password
  },
});

// Create a backup transport for your domain's SMTP
const domainTransport = createTransport({
  host: "mail.dringo.com.mx", // Your domain's SMTP server
  port: 465, // Port for SSL
  secure: true, // Use SSL
  auth: {
    user: DOMAIN_EMAIL, // Your domain email
    pass: DOMAIN_PASSWORD, // Your domain email password
  },
});

// Retry function with exponential backoff
async function retrySendMail(transport, mailOptions, maxRetries = 2) {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await transport.sendMail(mailOptions);
      console.log("Email sent successfully.");
      return;
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (attempt >= maxRetries) {
        console.error("All retries failed. Email not sent.");
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`Retrying in ${waitTime / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

// Function to send email
async function sendEmail(data) {
  const mailOptions = {
    from: `"Dringo App" <${SMTP_EMAIL}>`, // Sender's name and email
    to: data.to, // Recipient's email address
    subject: data.subject, // Email subject
    html: data.template, // HTML email body
  };

  try {
    // Verify Google's SMTP connection
    await googleTransport.verify();
    console.log("Google SMTP connection verified successfully.");

    // Retry sending the email using Google's SMTP
    await retrySendMail(googleTransport, mailOptions);
  } catch (error) {
    console.error("Error with Google SMTP. Attempting backup...");

    try {
      // Verify domain SMTP connection
      await domainTransport.verify();
      console.log("Domain SMTP connection verified successfully.");

      // Retry sending the email using domain SMTP
      await retrySendMail(domainTransport, mailOptions);
    } catch (backupError) {
      console.error("Backup SMTP failed as well. Email not sent.");
      throw backupError;
    }
  }
}

export default sendEmail;