/**
 * Type definitions for the WorkerGram library
 */

import { Update, User, Chat, Message, CallbackQuery, ChatMemberUpdated, ChatPermissions, WebhookInfo, ChatMember } from "@grammyjs/types";

/**
 * File interface for sending files to Telegram
 * Can be file_id, URL, or a file upload
 */
export interface File {
  file_id?: string;
  url?: string;
  filename?: string;
  contentType?: string;
  // We use any for binary data to avoid Node.js specific types
  data?: any;
}

/**
 * Telegram update types
 */
export type UpdateType =
  | "message"
  | "edited_message"
  | "channel_post"
  | "edited_channel_post"
  | "inline_query"
  | "chosen_inline_result"
  | "callback_query"
  | "shipping_query"
  | "pre_checkout_query"
  | "poll"
  | "poll_answer"
  | "my_chat_member"
  | "chat_member"
  | "chat_join_request";

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
  sendMessage(chatId: number | string, messageText: string, messageOptions?: SendMessageOptions): Promise<Message>;
  sendPhoto(chatId: number | string, photo: string, options?: SendPhotoOptions): Promise<Message>;
  sendDocument(chatId: number | string, document: string, options?: SendDocumentOptions): Promise<Message>;
  forwardMessage(chatId: number | string, fromChatId: number | string, messageId: number, options?: any): Promise<Message>;
  copyMessage(chatId: number | string, fromChatId: number | string, messageId: number, options?: CopyMessageOptions): Promise<{ message_id: number }>;

  // Interactive methods
  answerCallbackQuery(callbackQueryId: string, options?: AnswerCallbackQueryOptions): Promise<boolean>;

  // Chat management methods
  banChatMember(chatId: number | string, userId: number, untilDate?: number, revokeMessages?: boolean): Promise<boolean>;
  unbanChatMember(chatId: number | string, userId: number, onlyIfBanned?: boolean): Promise<boolean>;
  restrictChatMember(chatId: number | string, userId: number, permissions: ChatPermissions, untilDate?: number): Promise<boolean>;
  promoteChatMember(chatId: number | string, userId: number, options?: any): Promise<boolean>;
  setChatAdministratorCustomTitle(chatId: number | string, userId: number, customTitle: string): Promise<boolean>;

  // Forum topic management methods
  createForumTopic(chatId: number | string, name: string, options?: CreateForumTopicOptions): Promise<ForumTopic>;
  editForumTopic(chatId: number | string, messageThreadId: number, options: EditForumTopicOptions): Promise<boolean>;
  closeForumTopic(chatId: number | string, messageThreadId: number): Promise<boolean>;
  reopenForumTopic(chatId: number | string, messageThreadId: number): Promise<boolean>;
  deleteForumTopic(chatId: number | string, messageThreadId: number): Promise<boolean>;
  unpinAllForumTopicMessages(chatId: number | string, messageThreadId: number): Promise<boolean>;
  hideGeneralForumTopic(chatId: number | string): Promise<boolean>;
  unhideGeneralForumTopic(chatId: number | string): Promise<boolean>;
  getForumTopicIconStickers(): Promise<Sticker[]>;

  // Webhook methods
  setWebhook(url: string, options?: SetWebhookOptions): Promise<boolean>;
  deleteWebhook(dropPendingUpdates?: boolean): Promise<boolean>;
  getWebhookInfo(): Promise<WebhookInfo>;

  // Info methods
  getMe(): Promise<User>;
  getChatMember(chatId: number | string, userId: number): Promise<any>;
}

// Event handlers
export type MessageHandler = (ctx: MessageContext) => Promise<void> | void;
export type EditedMessageHandler = (ctx: EditedMessageContext) => Promise<void> | void;
export type CallbackQueryHandler = (ctx: CallbackQueryContext) => Promise<void> | void;
export type ChatMemberUpdateHandler = (ctx: ChatMemberUpdateContext) => Promise<void> | void;
export type GenericHandler<T> = (ctx: { bot: Bot; update: Update; [key: string]: any }) => Promise<void> | void;

// Event filter types
export type FilterFunction = (update: Update) => boolean;
export type FilterObject = Record<string, any>;
export type EventFilter = FilterFunction | RegExp | string | FilterObject;

// Context classes forward declarations
export interface BaseContext {
  bot: Bot;
  update: Update;
  reply(messageText: string, messageOptions?: SendMessageOptions): Promise<Message>;
}

export interface MessageContext extends BaseContext {
  message: Message;
  userId: number;
  chatId: number | string;
  topicId?: number;
  text?: string;
  command?: string;
  commandPayload?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  name?: string;
  reply(messageText: string, messageOptions?: SendMessageOptions): Promise<Message>;
  editText(messageText: string, messageOptions?: SendMessageOptions): Promise<Message | boolean>;
  delete(): Promise<boolean>;
  replyWithPhoto(photo: string, options?: SendPhotoOptions): Promise<Message>;
  replyWithDocument(document: string, options?: SendDocumentOptions): Promise<Message>;
  forwardMessage(toChatId: number | string, options?: any): Promise<Message>;
  copyMessage(toChatId: number | string, options?: CopyMessageOptions): Promise<{ message_id: number }>;
  getChat(): Promise<Chat>;
  banChatMember(userId: number, untilDate?: number, revokeMessages?: boolean): Promise<boolean>;
  unbanChatMember(userId: number, onlyIfBanned?: boolean): Promise<boolean>;

  // Forum topic management methods
  createForumTopic(name: string, options?: CreateForumTopicOptions): Promise<ForumTopic>;
  editForumTopic(messageThreadId: number, options: EditForumTopicOptions): Promise<boolean>;
  closeForumTopic(messageThreadId: number): Promise<boolean>;
  reopenForumTopic(messageThreadId: number): Promise<boolean>;
  deleteForumTopic(messageThreadId: number): Promise<boolean>;
  unpinAllForumTopicMessages(messageThreadId: number): Promise<boolean>;
  hideGeneralForumTopic(): Promise<boolean>;
  unhideGeneralForumTopic(): Promise<boolean>;
}

export interface CallbackQueryContext extends BaseContext {
  callbackQuery: CallbackQuery;
  message?: Message;
  userId: number;
  chatId?: number | string;
  topicId?: number;
  callbackData?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  name?: string;
  answer(text?: string, options?: AnswerCallbackQueryOptions): Promise<boolean>;
  editText(messageText: string, messageOptions?: SendMessageOptions): Promise<Message | boolean>;
  editReplyMarkup(replyMarkup: any, options?: any): Promise<Message | boolean>;
  deleteMessage(): Promise<boolean>;
  reply(messageText: string, messageOptions?: SendMessageOptions): Promise<Message>;
}

export interface EditedMessageContext extends BaseContext {
  editedMessage: Message;
  userId: number;
  chatId: number | string;
  topicId?: number;
  text?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  name?: string;
  reply(messageText: string, messageOptions?: SendMessageOptions): Promise<Message>;
  delete(): Promise<boolean>;
  replyWithPhoto(photo: string, options?: SendPhotoOptions): Promise<Message>;
  replyWithDocument(document: string, options?: SendDocumentOptions): Promise<Message>;
  forwardMessage(toChatId: number | string, options?: any): Promise<Message>;
  copyMessage(toChatId: number | string, options?: CopyMessageOptions): Promise<{ message_id: number }>;
  getChat(): Promise<Chat>;
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
  userId: number;
  chatId: number | string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  name?: string;
  reply(messageText: string, messageOptions?: SendMessageOptions): Promise<Message>;
  banUser(untilDate?: number, revokeMessages?: boolean): Promise<boolean>;
  unbanUser(onlyIfBanned?: boolean): Promise<boolean>;
}

/**
 * MessageEntity type for representing special entities in messages
 */
export interface MessageEntity {
  type:
    | "mention"
    | "hashtag"
    | "cashtag"
    | "bot_command"
    | "url"
    | "email"
    | "phone_number"
    | "bold"
    | "italic"
    | "underline"
    | "strikethrough"
    | "spoiler"
    | "code"
    | "pre"
    | "text_link"
    | "text_mention"
    | "custom_emoji";
  offset: number;
  length: number;
  url?: string; // For "text_link" only
  user?: User; // For "text_mention" only
  language?: string; // For "pre" only
  custom_emoji_id?: string; // For "custom_emoji" only
}

/**
 * Reply markup interface for various keyboard types
 */
export interface ReplyMarkup {
  inline_keyboard?: Array<
    Array<{
      text: string;
      url?: string;
      callback_data?: string;
      web_app?: { url: string };
      login_url?: { url: string; forward_text?: string; bot_username?: string; request_write_access?: boolean };
      switch_inline_query?: string;
      switch_inline_query_current_chat?: string;
      callback_game?: {};
      pay?: boolean;
    }>
  >;
  keyboard?: Array<
    Array<{
      text: string;
      request_contact?: boolean;
      request_location?: boolean;
      request_poll?: { type?: "quiz" | "regular" };
      web_app?: { url: string };
    }>
  >;
  remove_keyboard?: boolean;
  force_reply?: boolean;
  input_field_placeholder?: string;
  selective?: boolean;
  one_time_keyboard?: boolean;
  resize_keyboard?: boolean;
  is_persistent?: boolean;
}

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

export interface ForumTopic {
  message_thread_id: number;
  name: string;
  icon_color?: number;
  icon_custom_emoji_id?: string;
}

export interface Sticker {
  file_id: string;
  file_unique_id: string;
  type: string;
  width: number;
  height: number;
  is_animated: boolean;
  is_video: boolean;
  emoji?: string;
  custom_emoji_id?: string;
  thumbnail?: any;
  [key: string]: any;
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
export { Update, User, Chat, Message, CallbackQuery, ChatMemberUpdated, ChatPermissions, WebhookInfo, ChatMember };
