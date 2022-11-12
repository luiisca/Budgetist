import { Feedback } from "./templates/feedback-email";

export const sendFeedbackEmail = async (feedback: Feedback) => {
  await new Promise((resolve, reject) => {
    try {
      const feedbackEmail = new FeedbackEmail(feedback);
      resolve(feedbackEmail.sendEmail());
    } catch (e) {
      reject(console.error("FeedbackEmail.sendEmail failed", e));
    }
  });
};
