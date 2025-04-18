import { Update, Message, Chat, ChatMember, ChatPermissions, CallbackQuery, ChatMemberUpdated, User, InlineQuery, InlineQueryResultArticle, InlineQueryResultPhoto, InlineQueryResultDocument, InlineQueryResultVideo, InlineQueryResultLocation } from "@grammyjs/types";
import { BotInterface, ForumTopic, InlineQueryResult } from ".";
import { SendMessageOptions, SendPhotoOptions, SendDocumentOptions, CopyMessageOptions, CreateForumTopicOptions, EditForumTopicOptions, AnswerCallbackQueryOptions, AnswerInlineQueryOptions } from "./options";

// Common interfaces for context objects
export interface UserInfo {
  id: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  displayName?: string;
}

export interface ChatInfo {
  id: number | string;
  topicId?: number;
  type?: string;
  title?: string;
}

export interface MessageInfo {
  id: number;
  text?: string;
  command?: string;
  commandPayload?: string;
  date: number;
  isEdited?: boolean;
}

export interface CallbackInfo {
  id: string;
  data?: string;
  gameShortName?: string;
  inlineMessageId?: string;
  chatInstance: string;
}

export interface MemberUpdateInfo {
  oldStatus: string;
  newStatus: string;
  oldInfo: ChatMember;
  newInfo: ChatMember;
  updateType: string;
}

export interface InlineQueryInfo {
  id: string;
  query: string;
  offset?: string;
  chatType?: string;
}

import { MessageContextImpl } from "../context/messageContext";
import { CallbackQueryContextImpl } from "../context/callbackQueryContext";
import { ChatMemberUpdateContextImpl } from "../context/chatMemberUpdateContext";
import { EditedMessageContextImpl } from "../context/editedMessageContext";

// Context classes forward declarations

export interface BaseContext {
  // Common properties for all contexts
  bot: BotInterface;
  update: Update;
  
  // Common user information
  userId: number;
  user: UserInfo;
}

export interface MessageContext extends BaseContext {
  // Frequently accessed properties at top level
  chatId: number | string;
  messageId: number;
  text: string;
  
  // Organized property groups
  chat: ChatInfo;
  message: MessageInfo;
  
  // Message-specific methods
  reply(messageText: string, messageOptions?: SendMessageOptions, asReply?: boolean): Promise<Message>;
  editText(messageText: string, messageOptions?: SendMessageOptions): Promise<Message | boolean>;
  deleteMessage(): Promise<boolean>;
  replyWithPhoto(photo: string, options?: SendPhotoOptions, asReply?: boolean): Promise<Message>;
  replyWithDocument(document: string, options?: SendDocumentOptions, asReply?: boolean): Promise<Message>;
  forwardMessage(toChatId: number | string, options?: any): Promise<Message>;
  copyMessage(toChatId: number | string, options?: CopyMessageOptions): Promise<{ message_id: number; }>;
  getChat(): Promise<Chat>;
  banChatMember(userId: number, untilDate?: number, revokeMessages?: boolean): Promise<boolean>;
  unbanChatMember(userId: number, onlyIfBanned?: boolean): Promise<boolean>;
  isChatMemberOf(chatId: number | string, userId?: number): Promise<ChatMember>;
  restrictChatMember(permissions: ChatPermissions, untilDate?: number, chatId?: number): Promise<boolean>;

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
  // Frequently accessed properties at top level
  chatId?: number | string;
  messageId?: number;
  callbackData?: string;
  
  // Organized property groups
  chat?: ChatInfo;
  message?: MessageInfo;
  callback: CallbackInfo;

  // Callback query specific methods
  answer(text?: string, options?: AnswerCallbackQueryOptions): Promise<boolean>;
  reply(messageText: string, messageOptions?: SendMessageOptions, asReply?: boolean): Promise<Message>;
  editText(messageText: string, messageOptions?: SendMessageOptions): Promise<Message | boolean>;
  editReplyMarkup(replyMarkup: any, options?: any): Promise<Message | boolean>;
  deleteMessage(): Promise<boolean>;
  reply(messageText: string, messageOptions?: SendMessageOptions, asReply?: boolean): Promise<Message>;
  isChatMemberOf(chatId: number | string, userId?: number): Promise<ChatMember>;
  restrictChatMember(permissions: ChatPermissions, untilDate?: number, chatId?: number): Promise<boolean>;
  banChatMember(userId: number, untilDate?: number, revokeMessages?: boolean): Promise<boolean>;
  unbanChatMember(userId: number, onlyIfBanned?: boolean): Promise<boolean>;
}

export interface EditedMessageContext extends BaseContext {
  // Frequently accessed properties at top level
  chatId: number | string;
  messageId: number;
  text?: string;
  
  // Organized property groups
  chat: ChatInfo;
  message: MessageInfo;
  
  // Message specific methods
  reply(messageText: string, messageOptions?: SendMessageOptions, asReply?: boolean): Promise<Message>;
  deleteMessage(): Promise<boolean>;
  replyWithPhoto(photo: string, options?: SendPhotoOptions, asReply?: boolean): Promise<Message>;
  replyWithDocument(document: string, options?: SendDocumentOptions, asReply?: boolean): Promise<Message>;
  forwardMessage(toChatId: number | string, options?: any): Promise<Message>;
  copyMessage(toChatId: number | string, options?: CopyMessageOptions): Promise<{ message_id: number; }>;
  getChat(): Promise<Chat>;
  isChatMemberOf(chatId: number | string, userId?: number): Promise<ChatMember>;
  restrictChatMember(permissions: ChatPermissions, untilDate?: number, chatId?: number): Promise<boolean>;
  banChatMember(userId: number, untilDate?: number, revokeMessages?: boolean): Promise<boolean>;
  unbanChatMember(userId: number, onlyIfBanned?: boolean): Promise<boolean>;
}

export interface ChatMemberUpdateContext extends BaseContext {
  // Frequently accessed properties at top level
  chatId: number | string;
  
  // Organized property groups
  chat: ChatInfo;
  memberUpdate: MemberUpdateInfo;
  
  // Status check methods
  isJoining(): boolean;
  isLeaving(): boolean;
  isPromoted(): boolean;
  isDemoted(): boolean;
  reply(messageText: string, messageOptions?: SendMessageOptions, asReply?: boolean): Promise<Message>;
  banChatMember(userId?: number, untilDate?: number, revokeMessages?: boolean): Promise<boolean>;
  unbanChatMember(userId?: number, onlyIfBanned?: boolean): Promise<boolean>;
  isChatMemberOf(chatId: number | string): Promise<ChatMember>;
  restrictChatMember(permissions: ChatPermissions, untilDate?: number, chatId?: number): Promise<boolean>;
}

export interface InlineQueryContext extends BaseContext {
  // Frequently accessed properties at top level
  query: string;
  
  // Organized property groups
  inlineQuery: InlineQueryInfo;
  
  // Answer methods
  answer(results: ReadonlyArray<InlineQueryResult>, options?: AnswerInlineQueryOptions): Promise<boolean>;
  answerWithResults(results: ReadonlyArray<InlineQueryResult>, options?: AnswerInlineQueryOptions): Promise<boolean>;
  
  // Chat member utilities
  isChatMemberOf(chatId: number | string): Promise<ChatMember>;
  
  // Helper methods for creating inline query results
  createArticleResult(id: string, title: string, description: string, text: string, options?: Partial<InlineQueryResultArticle>): InlineQueryResultArticle;
  createPhotoResult(id: string, photoUrl: string, thumbnailUrl: string, title?: string, options?: Partial<InlineQueryResultPhoto>): InlineQueryResultPhoto;
  createDocumentResult(id: string, title: string, documentUrl: string, thumbnailUrl: string, options?: Partial<InlineQueryResultDocument>): InlineQueryResultDocument;
  createVideoResult(id: string, title: string, videoUrl: string, thumbnailUrl: string, options?: Partial<InlineQueryResultVideo>): InlineQueryResultVideo;
  createLocationResult(id: string, title: string, latitude: number, longitude: number, options?: Partial<InlineQueryResultLocation>): InlineQueryResultLocation;
  
  // Utility methods
  generateResultId(): string;
}
