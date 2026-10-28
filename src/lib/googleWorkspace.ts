import { auth, googleProvider } from "./firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from "firebase/auth";

export const WORKSPACE_SCOPES = [
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
];

// Configure scopes on the provider
WORKSPACE_SCOPES.forEach((scope) => {
  googleProvider.addScope(scope);
});

// Cache access token in-memory ONLY (never in localStorage or sessionStorage as required by skill)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Clear cached token on signout
onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedAccessToken = null;
  }
});

export async function signInWithGoogleWorkspace(): Promise<{ user: User; accessToken: string }> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Google Workspace access token could not be obtained.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Google Workspace Sign-in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

export function getWorkspaceAccessToken(): string | null {
  return cachedAccessToken;
}

export function setWorkspaceAccessToken(token: string | null) {
  cachedAccessToken = token;
}

export async function signOutWorkspace(): Promise<void> {
  await signOut(auth);
  cachedAccessToken = null;
}

// ==========================================
// GMAIL INTEGRATION APIS
// ==========================================

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export async function fetchGmailProfile(accessToken?: string): Promise<GmailProfile> {
  const token = accessToken || cachedAccessToken;
  if (!token) throw new Error("No Google Workspace access token available. Please sign in with Google.");

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Failed to fetch Gmail profile");
  }

  return response.json();
}

/**
 * Send an email directly via the Gmail REST API (users.messages.send)
 */
export async function sendGmailEmail({
  to,
  subject,
  bodyHtml,
  accessToken,
}: {
  to: string;
  subject: string;
  bodyHtml: string;
  accessToken?: string;
}): Promise<any> {
  const token = accessToken || cachedAccessToken;
  if (!token) throw new Error("No Google Workspace access token available. Please sign in with Google.");

  // RFC 2822 email format
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${utf8Subject}`,
    "",
    bodyHtml,
  ];
  const rawMessage = messageParts.join("\r\n");

  // Base64url encode
  const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Failed to send email via Gmail API");
  }

  return response.json();
}

/**
 * Search or list recent messages from the user's Gmail
 */
export async function listGmailMessages(
  query: string = "Al Raza",
  maxResults: number = 10,
  accessToken?: string
): Promise<any[]> {
  const token = accessToken || cachedAccessToken;
  if (!token) throw new Error("No Google Workspace access token available. Please sign in with Google.");

  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Failed to list Gmail messages");
  }

  const data = await response.json();
  const messagesList = data.messages || [];

  // Fetch details for first 5 messages
  const messageDetails = await Promise.all(
    messagesList.slice(0, 5).map(async (m: { id: string }) => {
      try {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (detailRes.ok) {
          const detail = await detailRes.json();
          const headers = detail.payload?.headers || [];
          const getHeader = (name: string) =>
            headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
          return {
            id: detail.id,
            snippet: detail.snippet,
            date: getHeader("Date"),
            from: getHeader("From"),
            subject: getHeader("Subject"),
          };
        }
      } catch {
        // ignore
      }
      return m;
    })
  );

  return messageDetails;
}

// ==========================================
// GOOGLE DRIVE INTEGRATION APIS
// ==========================================

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
}

/**
 * List files stored on Google Drive (filtered by default to store reports/backups or general files)
 */
export async function listGoogleDriveFiles(
  pageSize: number = 15,
  accessToken?: string
): Promise<DriveFileItem[]> {
  const token = accessToken || cachedAccessToken;
  if (!token) throw new Error("No Google Workspace access token available. Please sign in with Google.");

  const fields = "files(id,name,mimeType,createdTime,modifiedTime,size,webViewLink)";
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&fields=${encodeURIComponent(fields)}&orderBy=createdTime%20desc`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Failed to list Google Drive files");
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Upload a file directly to Google Drive (e.g. Order Backup CSV, Invoice, Catalog Export)
 */
export async function uploadFileToGoogleDrive({
  fileName,
  fileContent,
  mimeType = "text/csv",
  description = "Al Raza Cold Press Oil Mart Store Export",
  accessToken,
}: {
  fileName: string;
  fileContent: string;
  mimeType?: string;
  description?: string;
  accessToken?: string;
}): Promise<DriveFileItem> {
  const token = accessToken || cachedAccessToken;
  if (!token) throw new Error("No Google Workspace access token available. Please sign in with Google.");

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    description: description,
  };

  const boundary = "-------314159265358979323846";
  const delimiter = "\r\n--" + boundary + "\r\n";
  const closeDelimiter = "\r\n--" + boundary + "--";

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    fileContent +
    closeDelimiter;

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,createdTime,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Failed to upload file to Google Drive");
  }

  return response.json();
}

/**
 * Delete a file from Google Drive (Mandatory user confirmation enforced)
 */
export async function deleteFileFromGoogleDrive(
  fileId: string,
  fileName: string,
  accessToken?: string
): Promise<boolean> {
  const token = accessToken || cachedAccessToken;
  if (!token) throw new Error("No Google Workspace access token available. Please sign in with Google.");

  // Skill MANDATORY requirement: explicit confirmation dialog before destructive action
  const confirmed = window.confirm(
    `Are you sure you want to delete the file "${fileName}" from your Google Drive? This action cannot be undone.`
  );
  if (!confirmed) return false;

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok && response.status !== 204) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to delete file from Google Drive");
  }

  return true;
}
