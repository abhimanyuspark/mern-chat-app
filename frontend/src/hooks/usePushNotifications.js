import { useEffect } from "react";
import { PushNotifications } from "@capacitor/push-notifications";
import { FCM } from "@capacitor-community/fcm";
import { Capacitor } from "@capacitor/core";
import api from "../api/axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

/**
 * Hook to initialize and handle push notifications using Capacitor.
 */
const usePushNotifications = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Only initialize on native platforms and when user is logged in
    if (Capacitor.getPlatform() === "web" || !user) return;

    const registerPush = async () => {
      try {
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === "prompt") {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== "granted") {
          console.warn("Push notification permission not granted");
          return;
        }

        // Create notification channel for Android
        if (Capacitor.getPlatform() === "android") {
          await PushNotifications.createChannel({
            id: "chat_messages",
            name: "Chat Messages",
            description: "Notifications for new chat messages",
            importance: 5, // high
            visibility: 1, // public
            sound: "default",
          });
        }

        await PushNotifications.register();
      } catch (error) {
        console.error("Error during push notification registration:", error);
      }
    };

    registerPush();

    // Listeners
    const registrationListener = PushNotifications.addListener(
      "registration",
      async (pToken) => {
        console.log("Push registration success");
        try {
          // Use the community FCM plugin to get the actual FCM token
          const { token } = await FCM.getToken();
          console.log("FCM Token obtained: ", token);

          // Send the token to the backend
          await api.patch("/users/fcm-token", { fcmToken: token });
        } catch (err) {
          console.error("Error saving FCM token to backend", err);
        }
      },
    );

    const registrationErrorListener = PushNotifications.addListener(
      "registrationError",
      (error) => {
        console.error("Push registration error: ", error);
      },
    );

    const notificationReceivedListener = PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        console.log("Push notification received: ", notification);
        // Show an in-app toast for foreground notifications
        if (notification.title && notification.body) {
          toast.success(`${notification.title}: ${notification.body}`, {
            duration: 4000,
            position: "top-center",
          });
        }
      },
    );

    const notificationActionListener = PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification) => {
        console.log("Push notification action performed: ", notification);
        const data = notification.notification.data;
        if (data && data.conversationId) {
          // Navigate to specific chat
          navigate(`/chat/${data.conversationId}`);
        }
      },
    );

    return () => {
      // Clean up listeners
      registrationListener.then((l) => l.remove());
      registrationErrorListener.then((l) => l.remove());
      notificationReceivedListener.then((l) => l.remove());
      notificationActionListener.then((l) => l.remove());
    };
  }, [user]);
};

export default usePushNotifications;
