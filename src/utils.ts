import { Update } from "@grammyjs/types";

/**
 * Parse command and arguments from a message text
 * @param text Message text
 * @returns An object with command and args properties
 */
export function parseCommand(text: string): {
  command: string;
  args: string[];
} {
  const match = text.match(/^\/([^\s@]+)(?:@(\S+))?(?:\s+(.*))?$/);

  if (!match) {
    return { command: "", args: [] };
  }

  const command = match[1];
  const args = match[3] ? match[3].split(/\s+/) : [];

  return { command, args };
}

/**
 * Safely extract text from an update
 * @param update Telegram Update object
 * @returns Text from the update or undefined if not found
 */
export function extractText(update: Update): string | undefined {
  if ("message" in update && update.message && "text" in update.message) {
    return update.message.text;
  }

  if (
    "callback_query" in update &&
    update.callback_query &&
    update.callback_query.data
  ) {
    return update.callback_query.data;
  }

  return undefined;
}

/**
 * Safely extract chat ID from an update
 * @param update Telegram Update object
 * @returns Chat ID or undefined if not found
 */
export function extractChatId(update: Update): number | string | undefined {
  if ("message" in update && update.message) {
    return update.message.chat.id;
  }

  if (
    "callback_query" in update &&
    update.callback_query &&
    update.callback_query.message
  ) {
    return update.callback_query.message.chat.id;
  }

  if ("chat_member" in update && update.chat_member) {
    return update.chat_member.chat.id;
  }

  if ("my_chat_member" in update && update.my_chat_member) {
    return update.my_chat_member.chat.id;
  }

  return undefined;
}

/**
 * Safely extract user ID from an update
 * @param update Telegram Update object
 * @returns User ID or undefined if not found
 */
export function extractUserId(update: Update): number | undefined {
  if ("message" in update && update.message && update.message.from) {
    return update.message.from.id;
  }

  if (
    "callback_query" in update &&
    update.callback_query &&
    update.callback_query.from
  ) {
    return update.callback_query.from.id;
  }

  if ("chat_member" in update && update.chat_member) {
    return update.chat_member.new_chat_member.user.id;
  }

  if ("my_chat_member" in update && update.my_chat_member) {
    return update.my_chat_member.new_chat_member.user.id;
  }

  return undefined;
}

/**
 * Create a FormData object from a params object
 * @param params The parameters object
 * @returns A FormData object
 */
export function createFormData(params: Record<string, any>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;

    if (value instanceof File) {
      formData.append(key, value, value.name);
    } else if (typeof value === "object" && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }

  return formData;
}

/**
 * Get the mime type for a file based on its name
 * @param fileName The name of the file
 * @returns The mime type or application/octet-stream if unknown
 */
export function getMimeType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    zip: "application/zip",
    json: "application/json",
    txt: "text/plain",
    html: "text/html",
    css: "text/css",
    js: "text/javascript",
  };

  if (!extension || !mimeTypes[extension]) {
    return "application/octet-stream";
  }

  return mimeTypes[extension];
}

/**
 * Format a number as a file size with appropriate units
 * @param bytes Size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  } else {
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  }
}

/**
 * Check if a given value is a Promise
 * @param value The value to check
 * @returns Whether the value is a Promise
 */
export function isPromise(value: any): value is Promise<any> {
  return !!value && typeof value.then === "function";
}

/**
 * Escape Markdown v2 special characters in a string
 * @param text Text to escape
 * @returns Escaped text
 */
export function escapeMarkdown(text: string): string {
  // Characters that need to be escaped in MarkdownV2:
  // '_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'
  return text.replace(/([_*[\]()~`>#+=|{}.!\\])/g, "\\$1");
}

/**
 * Escape special characters for HTML formatting
 * @param text The text to escape
 * @returns The escaped text
 */
export function escapeHTML(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Sleep for a specified number of milliseconds
 * @param ms Milliseconds to sleep
 * @returns A promise that resolves after the specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
