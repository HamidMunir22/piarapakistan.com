const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  // Port 465 requires "secure: true" (implicit TLS); 587/25 use STARTTLS
  // (secure: false, then upgrade). Using the wrong combination for the
  // chosen port is a common reason connections hang until they time out.
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // IMPORTANT: nodemailer's default connection timeout is ~2 minutes. If the
  // host (e.g. Railway) blocks outbound SMTP or is slow to reach Gmail, every
  // email attempt used to hang for 2 minutes with the whole HTTP request
  // (register/login/order) blocked waiting on it. Failing fast here (10s)
  // means a broken SMTP connection can never freeze the rest of the site.
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

/**
 * Send an email.
 * @param {string} to - recipient email
 * @param {string} subject
 * @param {string} html
 */
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error("Email send error:", err.message);
    return false;
  }
};

module.exports = sendEmail;
