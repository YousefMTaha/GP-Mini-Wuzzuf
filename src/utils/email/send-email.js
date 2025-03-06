import nodemailer from "nodemailer";
import { config } from "dotenv";
import path from "path";
config({ path: path.resolve("src/config/.env") });
// transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});
export const sendEmail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    from: `"Job search app"<${process.env.EMAIL}>`,
    to,
    subject,
    html,
  });
  if (info.rejected.length > 0) return false;
  return true;
};
