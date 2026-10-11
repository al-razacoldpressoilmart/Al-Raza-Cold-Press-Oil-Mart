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

  static playChime() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1318.51, ctx.currentTime); // E6
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 1);
    } catch (e) {
      console.warn("Audio chime error:", e);
    }
  }

  /**
   * Show a notification
   */
  static notify(title: string, options?: NotificationOptions) {
    if (!("Notification" in window)) return;

    this.playChime();

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
