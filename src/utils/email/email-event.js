import { EventEmitter } from "events";
import { sendEmail } from "./send-email.js";
import {
  acceptanceEmailHTML,
  createHtml,
  rejectionEmailHTML,
} from "./email-template.js";
import { applicationStatus } from "../../DB/models/application.model.js";
export const emailEvent = new EventEmitter();

emailEvent.on("sendEmail", async (email, subject, otp) => {
  const html = createHtml(otp);
  await sendEmail({ to: email, subject, html });
  console.log("email sent");
});

emailEvent.on(
  "sendApplicationStatusEmail",
  async (email, status, userName, jobTitle, companyName) => {
    const html =
      status === "accepted"
        ? acceptanceEmailHTML({ userName, jobTitle, companyName })
        : rejectionEmailHTML({ userName, jobTitle, companyName });

    const subject =
      status === applicationStatus.ACCEPTED
        ? "Acceptance-Email"
        : "Rejection-Email";

    await sendEmail({ to: email, subject, html });
    console.log("email sent");
  }
);
