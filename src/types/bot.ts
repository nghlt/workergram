/**
 * src/types/bot.ts
 * Defines BotInterface, API endpoints, and update types for Workergram.
 */

import { Message, ChatPermissions, WebhookInfo, User, ChatMember, Sticker, ForumTopic, Chat } from "@grammyjs/types";
import {
  SendMessageOptions,
  SendPhotoOptions,
  SendDocumentOptions,
  CopyMessageOptions,
  AnswerCallbackQueryOptions,
  CreateForumTopicOptions,
  EditForumTopicOptions,
  SetWebhookOptions,
} from "./options";
import { FilterFunction, MessageHandler, GenericHandler } from "./eventHandlers";
import type { MessageInstance } from "../wrappers/messageInstance";

/**
 * Bot interface
 */

export interface BotInterface {
  /**
   * Register a handler for command messages
   * @param command The command to handle (without the leading slash)
   * @param handler The handler function
   * @param filter Additional filter function (optional)
   */
  onCommand(command: string, handler: MessageHandler, filter?: FilterFunction): void;

  /**
   * Register a handler for Telegram update types
   * @param updateType The type of update to handle
   * @param handler The handler function
   * @param filter Optional filter function
   */
  onUpdate(updateType: UpdateType, handler: GenericHandler<any>, filter?: FilterFunction): void;
  /**
   * Call the Telegram API
   * @param method The method to call
   * @param params The parameters to pass
   * @returns The result
   */
  callApi<T>(method: ApiEndpoints, params?: Record<string, any>): Promise<T>;
  // Messaging methods
  sendMessage(chatId: number | string, messageText: string, messageOptions?: SendMessageOptions): Promise<MessageInstance>;
  sendPhoto(chatId: number | string, photo: string, options?: SendPhotoOptions): Promise<MessageInstance>;
  sendDocument(chatId: number | string, document: string, options?: SendDocumentOptions): Promise<MessageInstance>;
  forwardMessage(chatId: number | string, fromChatId: number | string, messageId: number, options?: any): Promise<MessageInstance>;
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
  getChatMember(chatId: number | string, userId: number): Promise<ChatMember>;
  /**
   * Get information about a chat
   * @param chatId Chat ID
   */
  getChat(chatId: number | string): Promise<Chat>;
}

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
export type UpdateType = "message" | "chat_member" | "callback_query" | "inline_query" | "chosen_inline_result" ;
// | "edited_message"
// | "channel_post"
// | "edited_channel_post"
// | "shipping_query"
// | "pre_checkout_query"
// | "poll"
// | "poll_answer"
// | "my_chat_member"
// | "chat_join_request";

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

export type ApiEndpoints =
  | "getUpdates"
  | "setWebhook"
  | "deleteWebhook"
  | "getWebhookInfo"
  | "getMe"
  | "logOut"
  | "close"
  | "sendMessage"
  | "forwardMessage"
  | "copyMessage"
  | "sendPhoto"
  | "sendAudio"
  | "sendDocument"
  | "sendVideo"
  | "sendAnimation"
  | "sendVoice"
  | "sendVideoNote"
  | "sendMediaGroup"
  | "sendLocation"
  | "editMessageLiveLocation"
  | "stopMessageLiveLocation"
  | "sendVenue"
  | "sendContact"
  | "sendPoll"
  | "sendDice"
  | "sendChatAction"
  | "getUserProfilePhotos"
  | "getFile"
  | "banChatMember"
  | "unbanChatMember"
  | "restrictChatMember"
  | "promoteChatMember"
  | "setChatAdministratorCustomTitle"
  | "setChatPermissions"
  | "exportChatInviteLink"
  | "createChatInviteLink"
  | "editChatInviteLink"
  | "revokeChatInviteLink"
  | "approveChatJoinRequest"
  | "declineChatJoinRequest"
  | "setChatPhoto"
  | "deleteChatPhoto"
  | "setChatTitle"
  | "setChatDescription"
  | "pinChatMessage"
  | "unpinChatMessage"
  | "unpinAllChatMessages"
  | "leaveChat"
  | "getChat"
  | "getChatAdministrators"
  | "getChatMembersCount"
  | "getChatMember"
  | "getChatMenuButton"
  | "setChatMenuButton"
  | "setMyCommands"
  | "getMyCommands"
  | "deleteMyCommands"
  | "sendSticker"
  | "getStickerSet"
  | "uploadStickerFile"
  | "createNewStickerSet"
  | "addStickerToSet"
  | "setStickerPositionInSet"
  | "deleteStickerFromSet"
  | "setStickerSetThumb"
  | "editMessageText"
  | "editMessageCaption"
  | "editMessageMedia"
  | "editMessageReplyMarkup"
  | "deleteMessage"
  | "answerInlineQuery"
  | "answerCallbackQuery"
  | "answerWebAppQuery"
  | "sendInvoice"
  | "answerShippingQuery"
  | "answerPreCheckoutQuery"
  | "createInvoiceLink"
  | "sendGame"
  | "setGameScore"
  | "getGameHighScores"
  | "setPassportDataErrors"
  | "createForumTopic"
  | "editForumTopic"
  | "closeForumTopic"
  | "reopenForumTopic"
  | "deleteForumTopic"
  | "getForumTopicIconStickers"
  | "hideGeneralForumTopic"
  | "unhideGeneralForumTopic"
  | "unpinAllForumTopicMessages";

export type HandlerEntry = {
  event: UpdateType;
  handler: (ctx: any) => any;
  filter?: FilterFunction;
};
