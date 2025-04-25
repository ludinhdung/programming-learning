import broker from "./broker"
import { sendEmail } from "../utils/email.service"

console.log('Initializing course published listener...');

broker.subscribe('course_published', (message) => {
    const { courseName, courseThumbnail, instructorEmail } = message;


    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
      <h1 style="color: #2e7d32; font-size: 24px; margin-bottom: 16px;">🎉 Course Published Successfully!</h1>
      <p style="font-size: 16px; color: #333;"><strong>Course Name:</strong> ${courseName}</p>
      <div style="margin-top: 16px;">
        <p style="font-size: 16px; color: #333;"><strong>Course Thumbnail:</strong></p>
        <img src="${courseThumbnail}" alt="Course Thumbnail" style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);" />
      </div>
    </div>
  `;


    sendEmail(instructorEmail, "Publish Course Successfully", html);
});

export default broker;
