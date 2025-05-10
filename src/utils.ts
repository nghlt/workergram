

/**
 * src/utils.ts
 * Utility functions for parsing updates, extracting data, and formatting output in Workergram.
 */

import { Update, Message } from "@grammyjs/types";
import { MimeTypes } from "./types/media";
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
 */
export function extractText(update: Update): string | undefined {
  if ("message" in update && update.message && "text" in update.message) {
    return update.message.text;
  }
  if ("callback_query" in update && update.callback_query && update.callback_query.data) {
    return update.callback_query.data;
  }
  return undefined;
}

/**
 * Safely extract chat ID from an update
 */
export function extractChatId(update: Update): number | string | undefined {
  if ("message" in update && update.message) {
    return update.message.chat.id;
  }
  if ("callback_query" in update && update.callback_query && update.callback_query.message) {
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
 */
export function extractUserId(update: Update): number | undefined {
  if ("message" in update && update.message && update.message.from) {
    return update.message.from.id;
  }
  if ("callback_query" in update && update.callback_query && update.callback_query.from) {
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
 */
export function createFormData(params: Record<string, any>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (typeof value === "object" && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }
  return formData;
}

/**
 * Get the mime type for a file based on its name
 */
export function getMimeType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension || !MimeTypes[extension]) {
    return "application/octet-stream";
  }
  return MimeTypes[extension];
}

/**
 * Format a number as a file size with appropriate units
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
 */
export function isPromise(value: any): value is Promise<any> {
  return !!value && typeof value.then === "function";
}

/**
 * Escape Markdown v2 special characters in a string
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/([_*[\]()~`>#+=|{}.!\\])/g, "\\$1");
}

/**
 * Escape special characters for HTML formatting
 */
export function escapeHTML(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine type of message
 */
export function determineMessageType(message: Message): 'text' | 'photo' | 'video' | 'audio' | 'document' | 'sticker' | 'voice' | 'videoNote' | 'animation' {
  if (message.text) return 'text';
  if (message.photo) return 'photo';
  if (message.video) return 'video';
  if (message.audio) return 'audio';
  if (message.document) return 'document';
  if (message.sticker) return 'sticker';
  if (message.voice) return 'voice';
  if (message.video_note) return 'videoNote';
  if (message.animation) return 'animation';
  return 'text';
}