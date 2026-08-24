import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  || path.join(__dirname, "../../firebase-service-account.json");

let isInitialized = false;

if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    isInitialized = true;
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
  }
} else {
  console.warn("Firebase service account file not found at " + serviceAccountPath + ". Push notifications will be disabled.");
}

/**
 * Sends a push notification to multiple device tokens (multicast).
 * @param {string[]} tokens - Array of recipient FCM registration tokens.
 * @param {string} title - Notification title.
 * @param {string} body - Notification message body.
 * @param {object} data - Optional payload data.
 */
export const sendPushNotification = async (tokens, title, body, data = {}) => {
  if (!isInitialized || !tokens || tokens.length === 0) {
    return null;
  }

  // Filter out null/undefined tokens
  const validTokens = tokens.filter((t) => t);
  if (validTokens.length === 0) return null;

  const message = {
    notification: {
      title,
      body,
    },
    data: {
      ...data,
    },
    android: {
      notification: {
        sound: "default",
        channelId: "chat_messages", // Match the channel created on frontend
      },
    },
    tokens: validTokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Successfully sent ${response.successCount} notifications`);

    // Cleanup invalid tokens if needed (response.responses contains individual results)
    return response;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return null;
  }
};

