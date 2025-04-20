/**
 * src/types/options.ts
 * Defines option interfaces for various Telegram API methods in Workergram, including send, forward, and callback query options.
 */

import { MessageEntity, ReplyMarkup } from "./entitites";


// API options types

export interface SendMessageOptions {
  message_thread_id?: number; // Forum topic identifier
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  entities?: MessageEntity[];
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: ReplyMarkup;
}

export interface SendPhotoOptions {
  message_thread_id?: number; // Forum topic identifier
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  caption_entities?: MessageEntity[];
  has_spoiler?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: ReplyMarkup;
}

export interface SendDocumentOptions {
  message_thread_id?: number; // Forum topic identifier
  thumbnail?: string;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  caption_entities?: MessageEntity[];
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
  caption_entities?: MessageEntity[];
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

export interface AnswerInlineQueryOptions {
  cache_time?: number;
  is_personal?: boolean;
  next_offset?: string;
  switch_pm_text?: string;
  switch_pm_parameter?: string;
}
