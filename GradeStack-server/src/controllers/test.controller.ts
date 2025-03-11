import { sendEmail } from "../utils/email.service";
import { uploadFile, updateFile, deleteFile } from "../utils/storage.service";


//test send mail
const sendTestEmail = async () => {
  await sendEmail(
    "dungdung23092002@gmail.com",
    "Test Email",
    "<h1>Hello from Node.js + TypeScript!</h1>"
  );
};


// sendTestEmail();

const filePath = "./Menu Co.png";

// uploadFile(filePath).then((url) => console.log("File uploaded:", url));
deleteFile("README.md").then((status) => console.log("Delete status:" ,status));
