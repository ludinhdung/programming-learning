import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.configDotenv();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false, // true nếu dùng port 465, false với 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log("Email sent: ", info.messageId);
    return info;
  } catch (error) {
    console.log(process.env.SMTP_PASS);
    console.log(process.env.SMTP_USER);
    console.error("Error sending email: ", error);
    throw error;
  }
};


