/**
 * Type definitions for the WorkerGram library
 */

import {
  Update,
  User,
  Chat,
  Message,
  CallbackQuery,
  ChatMemberUpdated,
  ChatPermissions,
  WebhookInfo,
  ChatMember,
} from "@grammyjs/types";

/**
 * Bot interface
 */
export interface Bot {
  /**
   * Call the Telegram API
   * @param method The method to call
   * @param params The parameters to pass
   * @returns The result
   */
  callApi<T>(method: string, params?: Record<string, any>): Promise<T>;
  // Messaging methods
  sendMessage(
    chatId: number | string,
    messageText: string,
    messageOptions?: SendMessageOptions,
  ): Promise<Message>;
  sendPhoto(
    chatId: number | string,
    photo: string | File,
    options?: SendPhotoOptions,
  ): Promise<Message>;
  sendDocument(
    chatId: number | string,
    document: string | File,
    options?: SendDocumentOptions,
  ): Promise<Message>;
  forwardMessage(
    chatId: number | string,
    fromChatId: number | string,
    messageId: number,
    options?: any,
  ): Promise<Message>;
  copyMessage(
    chatId: number | string,
    fromChatId: number | string,
    messageId: number,
    options?: CopyMessageOptions,
  ): Promise<{ message_id: number }>;

  // Interactive methods
  answerCallbackQuery(
    callbackQueryId: string,
    options?: AnswerCallbackQueryOptions,
  ): Promise<boolean>;

  // Chat management methods
  banChatMember(
    chatId: number | string,
    userId: number,
    untilDate?: number,
    revokeMessages?: boolean,
  ): Promise<boolean>;
  unbanChatMember(
    chatId: number | string,
    userId: number,
    onlyIfBanned?: boolean,
  ): Promise<boolean>;
  restrictChatMember(
    chatId: number | string,
    userId: number,
    permissions: ChatPermissions,
    untilDate?: number,
  ): Promise<boolean>;
  promoteChatMember(
    chatId: number | string,
    userId: number,
    options?: any,
  ): Promise<boolean>;
  setChatAdministratorCustomTitle(
    chatId: number | string,
    userId: number,
    customTitle: string,
  ): Promise<boolean>;

  // Webhook methods
  setWebhook(url: string, options?: SetWebhookOptions): Promise<boolean>;
  deleteWebhook(dropPendingUpdates?: boolean): Promise<boolean>;
  getWebhookInfo(): Promise<WebhookInfo>;

  // Info methods
  getMe(): Promise<User>;
  getChatMember(chatId: number | string, userId: number): Promise<any>;
}

// Update Types
export type UpdateType = 'message'|'edited_message'|'channel_post'|'edited_channel_post'|'inline_query'|'chosen_inline_result'|'callback_query'|'shipping_query'|'pre_checkout_query'|'poll'|'poll_answer'|'my_chat_member'|'chat_member'|'chat_join_request'

// Event handlers
export type MessageHandler = (ctx: MessageContext) => Promise<void> | void;
export type CallbackQueryHandler = (
  ctx: CallbackQueryContext,
) => Promise<void> | void;
export type ChatMemberUpdateHandler = (
  ctx: ChatMemberUpdateContext,
) => Promise<void> | void;
export type GenericHandler<T> = (ctx: {
  bot: Bot;
  update: Update;
  [key: string]: any;
}) => Promise<void> | void;

// Event filter types
export type FilterFunction = (update: Update) => boolean;
export type FilterObject = Record<string, any>;
export type EventFilter = FilterFunction | RegExp | string | FilterObject;

// Context classes forward declarations
export interface BaseContext {
  bot: Bot;
  update: Update;
  reply(
    messageText: string,
    messageOptions?: SendMessageOptions,
  ): Promise<Message>;
}

export interface MessageContext extends BaseContext {
  message: Message;
  reply(
    messageText: string,
    messageOptions?: SendMessageOptions,
  ): Promise<Message>;
  editText(
    messageText: string,
    messageOptions?: SendMessageOptions,
  ): Promise<Message | boolean>;
  delete(): Promise<boolean>;
  replyWithPhoto(
    photo: string | File,
    options?: SendPhotoOptions,
  ): Promise<Message>;
  replyWithDocument(
    document: string | File,
    options?: SendDocumentOptions,
  ): Promise<Message>;
  getChat(): Promise<Chat>;
  banChatMember(
    userId: number,
    untilDate?: number,
    revokeMessages?: boolean,
  ): Promise<boolean>;
  unbanChatMember(userId: number, onlyIfBanned?: boolean): Promise<boolean>;
}

export interface CallbackQueryContext extends BaseContext {
  callbackQuery: CallbackQuery;
  message?: Message;
  answer(text?: string, options?: AnswerCallbackQueryOptions): Promise<boolean>;
  editText(
    messageText: string,
    messageOptions?: SendMessageOptions,
  ): Promise<Message | boolean>;
  editReplyMarkup(replyMarkup: any, options?: any): Promise<Message | boolean>;
  deleteMessage(): Promise<boolean>;
  reply(
    messageText: string,
    messageOptions?: SendMessageOptions,
  ): Promise<Message>;
}

export interface ChatMemberUpdateContext extends BaseContext {
  chatMemberUpdate: ChatMemberUpdated;
  updateType: "chat_member" | "my_chat_member";
  oldStatus: string;
  newStatus: string;
  isJoining(): boolean;
  isLeaving(): boolean;
  isPromoted(): boolean;
  isDemoted(): boolean;
  user: User;
  chat: Chat;
  reply(
    messageText: string,
    messageOptions?: SendMessageOptions,
  ): Promise<Message>;
  banUser(untilDate?: number, revokeMessages?: boolean): Promise<boolean>;
  unbanUser(onlyIfBanned?: boolean): Promise<boolean>;
}

// API options types
export interface SendMessageOptions {
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  entities?: any[];
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: any;
}

export interface SendPhotoOptions {
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  caption_entities?: any[];
  has_spoiler?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: any;
}

export interface SendDocumentOptions {
  thumbnail?: string | File;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  caption_entities?: any[];
  disable_content_type_detection?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: any;
}

export interface CopyMessageOptions {
  message_thread_id?: number;
  caption?: string;
  parse_mode?: "Markdown" | "MarkdownV2" | "HTML";
  caption_entities?: any[];
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: any;
}

export interface AnswerCallbackQueryOptions {
  text?: string;
  show_alert?: boolean;
  url?: string;
  cache_time?: number;
}

export interface SetWebhookOptions {
  certificate?: string | File;
  ip_address?: string;
  max_connections?: number;
  allowed_updates?: string[];
  drop_pending_updates?: boolean;
  secret_token?: string;
}

/**
 * API response type
 */
export interface ApiResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
  parameters?: {
    migrate_to_chat_id?: number;
    retry_after?: number;
  };
}

// Export types from grammyjs/types for convenience
export {
  Update,
  User,
  Chat,
  Message,
  CallbackQuery,
  ChatMemberUpdated,
  ChatPermissions,
  WebhookInfo,
  ChatMember,
};
