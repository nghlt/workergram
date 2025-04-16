import { Update, Message, Chat, ChatMember, ChatPermissions, CallbackQuery, ChatMemberUpdated, User } from "@grammyjs/types";
import { BotInterface, ForumTopic } from ".";
import { SendMessageOptions, SendPhotoOptions, SendDocumentOptions, CopyMessageOptions, CreateForumTopicOptions, EditForumTopicOptions, AnswerCallbackQueryOptions } from "./options";


// Context classes forward declarations

export interface BaseContext {
  bot: BotInterface;
  update: Update;
  reply(messageText: string, messageOptions?: SendMessageOptions): Promise<Message>;
}

export interface MessageContext extends BaseContext {
  message: Message;
  userId: number;
  chatId: number | string;
  topicId?: number;
  text: string;
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
  isChatMemberOf(chatId: number | string, userId?: number): Promise<ChatMember>;
  restrictChatMember(permissions: ChatPermissions, untilDate?: number, chatId?: number): Promise<boolean>;
  banChatMember(userId: number, untilDate?: number, revokeMessages?: boolean): Promise<boolean>;
  unbanChatMember(userId: number, onlyIfBanned?: boolean): Promise<boolean>;
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
  copyMessage(toChatId: number | string, options?: CopyMessageOptions): Promise<{ message_id: number; }>;
  getChat(): Promise<Chat>;
  isChatMemberOf(chatId: number | string, userId?: number): Promise<ChatMember>;
  restrictChatMember(permissions: ChatPermissions, untilDate?: number, chatId?: number): Promise<boolean>;
  banChatMember(userId: number, untilDate?: number, revokeMessages?: boolean): Promise<boolean>;
  unbanChatMember(userId: number, onlyIfBanned?: boolean): Promise<boolean>;
}

export interface ChatMemberUpdateContext extends BaseContext {
  chatMemberUpdate: ChatMemberUpdated;
  updateType: "chat_member";
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
  oldInfo: ChatMember;
  newInfo: ChatMember;
  name?: string;
  reply(messageText: string, messageOptions?: SendMessageOptions): Promise<Message>;
  banUser(untilDate?: number, revokeMessages?: boolean): Promise<boolean>;
  unbanUser(onlyIfBanned?: boolean): Promise<boolean>;
  isChatMemberOf(chatId: number | string): Promise<ChatMember>;
  restrictChatMember(permissions: ChatPermissions, untilDate?: number, chatId?: number): Promise<boolean>;
}
