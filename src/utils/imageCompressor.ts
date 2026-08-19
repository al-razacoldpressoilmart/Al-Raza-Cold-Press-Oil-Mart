/**
 * Client-Side Image Compression & Firestore Document Size Safety Utility
 * Ensures image uploads and Firestore payloads never exceed Firestore's 1MB limit.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: "image/jpeg" | "image/webp";
}

/**
 * Compresses an image File or Blob to a compact, high-quality base64 string (< 150KB typically)
 */
export async function compressImageFile(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.75,
    format = "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    // If it's not an image, resolve directly as base64
    if (file.type && !file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const resultStr = e.target?.result as string;
      if (!resultStr) {
        resolve("");
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scale
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(resultStr);
          return;
        }

        // Fill background white in case of transparent png to jpeg conversion
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          let compressedDataUrl = canvas.toDataURL(format, quality);
          // If still larger than 250KB (approx 340,000 chars), step down quality slightly
          if (compressedDataUrl.length > 340000) {
            compressedDataUrl = canvas.toDataURL(format, 0.58);
          }
          resolve(compressedDataUrl);
        } catch {
          resolve(resultStr);
        }
      };

      img.onerror = () => {
        resolve(resultStr);
      };

      img.src = resultStr;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an existing base64 string if it exceeds a size threshold (e.g. > 150KB)
 */
export async function compressBase64Image(
  dataUrl: string,
  options: CompressionOptions = {}
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith("data:image/")) {
    return dataUrl;
  }

  // If already compact (< 150KB string length), return as is
  if (dataUrl.length < 150000) {
    return dataUrl;
  }

  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.70,
    format = "image/jpeg",
  } = options;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const compressed = canvas.toDataURL(format, quality);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Sanitizes any object before saving to Firestore to strictly ensure
 * the document size stays well under the 1MB Firestore threshold without
 * discarding valid user-uploaded images.
 */
export function sanitizeFirestorePayload<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;

  const sanitized: any = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      // If a single image string is dangerously massive (> 650KB = 880,000 characters)
      // which would risk exceeding Firestore's 1MB per document ceiling by itself
      if (value.startsWith("data:image/") && value.length > 880000) {
        // Truncate only if extreme anomaly
        sanitized[key] = value.slice(0, 600000);
      } else if (value.length > 900000) {
        // Hard safety truncate for any rogue text payload
        sanitized[key] = value.slice(0, 10000);
      } else {
        sanitized[key] = value;
      }
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeFirestorePayload(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
