import { sendEmail } from "../utils/email.service";


//test send mail
const sendTestEmail = async () => {
  await sendEmail(
    "dungdung23092002@gmail.com",
    "Test Email",
    "<h1>Hello from Node.js + TypeScript!</h1>"
  );
};

sendTestEmail();
