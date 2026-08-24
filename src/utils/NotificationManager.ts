export class NotificationManager {
  /**
   * Request permission for Web Notifications
   */
  static async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notification");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  /**
   * Show a notification
   */
  static notify(title: string, options?: NotificationOptions) {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      try {
        const notification = new Notification(title, {
          icon: "/icon.png", // Optional default icon
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (e) {
        console.warn("Error showing notification:", e);
      }
    } else if (Notification.permission !== "denied") {
      // Try asking for permission if not explicitly denied yet
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          try {
            const notification = new Notification(title, {
              icon: "/icon.png",
              ...options,
            });

            notification.onclick = () => {
              window.focus();
              notification.close();
            };
          } catch (e) {
            console.warn("Error showing notification:", e);
          }
        }
      });
    }
  }
}
