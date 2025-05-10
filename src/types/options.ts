/**
 * src/types/options.ts
 * Defines option interfaces for various Telegram API methods in Workergram, including send, forward, and callback query options.
 */


import { MessageEntities } from "./entitites";
import { ReplyMarkup } from "./markup";
import { MimeTypes } from "./media";







// API options types

export interface SendMessageOptions {
  message_thread_id?: number; // Forum topic identifier
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  entities?: MessageEntities;
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: ReplyMarkup;
}


export interface FileInput {
  buffer: ArrayBuffer;
  mimeType: "image/jpeg" | "image/png" | "image/gif" | "video/mp4" | "audio/mpeg" | "application/pdf" | "application/msword" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "application/vnd.ms-excel" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" | "application/zip" | "application/json" | "text/plain" | "text/html" | "text/css" | "text/javascript" | "application/octet-stream";
  fileName: string;
}

// Type helper to extract keys from FileInput
export type FileInputKeys = keyof FileInput;

// Constant array of required keys
export const FILE_INPUT_KEYS: FileInputKeys[] = ['buffer', 'mimeType', 'fileName'];

/**
 * Represents a file to be sent to Telegram
 * Can be:
 * 1. file_id (string) - for files already on Telegram servers
 * 2. URL (string) - for files to be downloaded by Telegram (max 5MB for photos, 20MB for other files)
 * 3. File data (ArrayBuffer/Uint8Array) - for direct upload (max 10MB for photos, 50MB for other files)
 */
export type MediaInput = string | FileInput;

export interface SendPhotoOptions {
  message_thread_id?: number; // Forum topic identifier
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  caption_entities?: MessageEntities;
  has_spoiler?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: ReplyMarkup;
}

export interface SendDocumentOptions {
  message_thread_id?: number; // Forum topic identifier
  thumbnail?: MediaInput;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  caption_entities?: MessageEntities;
  disable_content_type_detection?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: ReplyMarkup;
}

export interface CopyMessageOptions {
  message_thread_id?: number; // Forum topic identifier
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  caption_entities?: MessageEntities;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: ReplyMarkup;
}

export interface ForwardMessageOptions {
  message_thread_id?: number;
  protect_content?: boolean;
  disable_notification?: boolean;
  video_start_timestamp?: number;
}

export interface AnswerCallbackQueryOptions {
  text?: string;
  show_alert?: boolean;
  url?: string;
  cache_time?: number;
}

export interface SetWebhookOptions {
  certificate?: string;
  ip_address?: string;
  max_connections?: number;
  allowed_updates?: string[];
  drop_pending_updates?: boolean;
  secret_token?: string;
}

export interface CreateForumTopicOptions {
  icon_color?: number;
  icon_custom_emoji_id?: string;
}

export interface EditForumTopicOptions {
  name?: string;
  icon_custom_emoji_id?: string;
}

export interface SendVideoOptions {
  message_thread_id?: number; // Forum topic identifier
  duration?: number;
  width?: number;
  height?: number;
  thumbnail?: MediaInput;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  caption_entities?: MessageEntities;
  supports_streaming?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: ReplyMarkup;
}

export interface SendStickerOptions {
  message_thread_id?: number; // Forum topic identifier
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: ReplyMarkup;
}

export interface SendAudioOptions {
  message_thread_id?: number; // Forum topic identifier
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  caption_entities?: MessageEntities;
  duration?: number;
  performer?: string;
  title?: string;
  thumbnail?: MediaInput;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: ReplyMarkup;
}

export type ChatAction = 
  | 'typing'
  | 'upload_photo'
  | 'record_video'
  | 'upload_video'
  | 'record_voice'
  | 'upload_voice'
  | 'upload_document'
  | 'choose_sticker'
  | 'find_location'
  | 'record_video_note'
  | 'upload_video_note';

export interface AnswerInlineQueryOptions {
  cache_time?: number;
  is_personal?: boolean;
  next_offset?: string;
  switch_pm_text?: string;
  switch_pm_parameter?: string;
}
