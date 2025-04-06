import {
  Update,
  Message,
  CallbackQuery,
  Chat,
  ChatMemberUpdated,
  User,
} from "@grammyjs/types";
import {
  Bot,
  BaseContext,
  MessageContext,
  EditedMessageContext,
  CallbackQueryContext,
  ChatMemberUpdateContext,
  SendMessageOptions,
  SendPhotoOptions,
  SendDocumentOptions,
  AnswerCallbackQueryOptions,
} from "./types";

/**
 * Base context class for all update types
 */
export class BaseContextImpl implements BaseContext {
  bot: Bot;
  update: Update;

  constructor(bot: Bot, update: Update) {
    this.bot = bot;
    this.update = update;
  }

  /**
   * Reply to the current update
   * @param messageText Text of the reply
   * @param messageOptions Additional options for sending the message
   */
  async reply(
    messageText: string,
    messageOptions: SendMessageOptions = {},
  ): Promise<Message> {
    throw new Error("Method not implemented in base context");
  }
}

/**
 * Context class for message updates
 */
export class MessageContextImpl
  extends BaseContextImpl
  implements MessageContext
{
  message: Message;
  userId: number;
  chatId: number | string;
  topicId?: number;
  text?: string;
  command?: string;
  commandPayload?: string;

  constructor(bot: Bot, update: Update) {
    super(bot, update);
    this.message = update.message!;
    this.userId = this.message.from?.id || 0;
    this.chatId = this.message.chat.id;
    this.topicId = this.message.message_thread_id;
    this.text = this.message.text;

    // Parse command if present
    if (this.text && this.text.startsWith('/')) {
      const commandMatch = this.text.match(/^\/([a-zA-Z0-9_]+)(?:@\w+)?(?:\s+(.*))?$/);
      if (commandMatch) {
        this.command = commandMatch[1];
        this.commandPayload = commandMatch[2];
      }
    }
  }

  /**
   * Reply to the current message
   * @param messageText Text of the reply
   * @param messageOptions Additional options for sending the message
   */
  async reply(
    messageText: string,
    messageOptions: SendMessageOptions = {},
  ): Promise<Message> {
    return this.bot.sendMessage(this.message.chat.id, messageText, {
      reply_to_message_id: this.message.message_id,
      ...messageOptions,
    });
  }

  /**
   * Edit the current message
   * @param messageText New text for the message
   * @param messageOptions Additional options for editing the message
   */
  async editText(
    messageText: string,
    messageOptions: SendMessageOptions = {},
  ): Promise<Message | boolean> {
    return this.bot.callApi("editMessageText", {
      chat_id: this.message.chat.id,
      message_id: this.message.message_id,
      text: messageText,
      ...messageOptions,
    });
  }

  /**
   * Delete the current message
   */
  async delete(): Promise<boolean> {
    return this.bot.callApi("deleteMessage", {
      chat_id: this.message.chat.id,
      message_id: this.message.message_id,
    });
  }

  /**
   * Send a photo in reply to the current message
   * @param photo Photo to send (file ID, URL, or File object)
   * @param options Additional options for sending the photo
   */
  async replyWithPhoto(
    photo: string | File,
    options: SendPhotoOptions = {},
  ): Promise<Message> {
    return this.bot.sendPhoto(this.message.chat.id, photo, {
      reply_to_message_id: this.message.message_id,
      ...options,
    });
  }

  /**
   * Send a document in reply to the current message
   * @param document Document to send (file ID, URL, or File object)
   * @param options Additional options for sending the document
   */
  async replyWithDocument(
    document: string | File,
    options: SendDocumentOptions = {},
  ): Promise<Message> {
    return this.bot.sendDocument(this.message.chat.id, document, {
      reply_to_message_id: this.message.message_id,
      ...options,
    });
  }

  /**
   * Get information about the chat
   */
  async getChat(): Promise<Chat> {
    return this.bot.callApi("getChat", {
      chat_id: this.message.chat.id,
    });
  }

  /**
   * Ban a user from the chat
   * @param userId User ID to ban
   * @param untilDate Date when the user will be unbanned (0 or not specified - forever)
   * @param revokeMessages Pass True to delete all messages from the chat for the user
   */
  async banChatMember(
    userId: number,
    untilDate?: number,
    revokeMessages?: boolean,
  ): Promise<boolean> {
    return this.bot.banChatMember(
      this.message.chat.id,
      userId,
      untilDate,
      revokeMessages,
    );
  }

  /**
   * Unban a user from the chat
   * @param userId User ID to unban
   * @param onlyIfBanned Pass True to unban only if the user is banned
   */
  async unbanChatMember(
    userId: number,
    onlyIfBanned?: boolean,
  ): Promise<boolean> {
    return this.bot.unbanChatMember(this.message.chat.id, userId, onlyIfBanned);
  }
}

/**
 * Context class for callback query updates
 */
export class CallbackQueryContextImpl
  extends BaseContextImpl
  implements CallbackQueryContext
{
  callbackQuery: CallbackQuery;
  message?: Message;
  userId: number;
  chatId?: number | string;
  topicId?: number;
  callbackData?: string;

  constructor(bot: Bot, update: Update) {
    super(bot, update);
    this.callbackQuery = update.callback_query!;
    this.message = this.callbackQuery.message;
    this.userId = this.callbackQuery.from.id;
    this.chatId = this.message?.chat.id;
    this.topicId = this.message?.message_thread_id;
    this.callbackData = this.callbackQuery.data;
  }

  /**
   * Answer the callback query
   * @param text Text to show to the user
   * @param options Additional options for answering the callback query
   */
  async answer(
    text?: string,
    options: AnswerCallbackQueryOptions = {},
  ): Promise<boolean> {
    return this.bot.answerCallbackQuery(this.callbackQuery.id, {
      text,
      ...options,
    });
  }

  /**
   * Edit the message text
   * @param messageText New text for the message
   * @param messageOptions Additional options for editing the message
   */
  async editText(
    messageText: string,
    messageOptions: SendMessageOptions = {},
  ): Promise<Message | boolean> {
    if (!this.message) {
      throw new Error("Cannot edit message: no message in callback query");
    }

    return this.bot.callApi("editMessageText", {
      chat_id: this.message.chat.id,
      message_id: this.message.message_id,
      text: messageText,
      ...messageOptions,
    });
  }

  /**
   * Edit the message reply markup
   * @param replyMarkup New reply markup for the message
   * @param options Additional options for editing the message
   */
  async editReplyMarkup(
    replyMarkup: any,
    options: any = {},
  ): Promise<Message | boolean> {
    if (!this.message) {
      throw new Error("Cannot edit message: no message in callback query");
    }

    return this.bot.callApi("editMessageReplyMarkup", {
      chat_id: this.message.chat.id,
      message_id: this.message.message_id,
      reply_markup: replyMarkup,
      ...options,
    });
  }

  /**
   * Delete the associated message
   */
  async deleteMessage(): Promise<boolean> {
    if (!this.message) {
      throw new Error("Cannot delete message: no message in callback query");
    }

    return this.bot.callApi("deleteMessage", {
      chat_id: this.message.chat.id,
      message_id: this.message.message_id,
    });
  }

  /**
   * Reply to the associated message
   * @param messageText Text of the reply
   * @param messageOptions Additional options for sending the message
   */
  async reply(
    messageText: string,
    messageOptions: SendMessageOptions = {},
  ): Promise<Message> {
    if (!this.message) {
      throw new Error("Cannot reply to message: no message in callback query");
    }

    return this.bot.sendMessage(this.message.chat.id, messageText, {
      reply_to_message_id: this.message.message_id,
      ...messageOptions,
    });
  }
}

/**
 * Context class for edited message updates
 */
export class EditedMessageContextImpl
  extends BaseContextImpl
  implements EditedMessageContext
{
  editedMessage: Message;
  userId: number;
  chatId: number | string;
  topicId?: number;
  text?: string;

  constructor(bot: Bot, update: Update) {
    super(bot, update);
    this.editedMessage = update.edited_message!;
    this.userId = this.editedMessage.from?.id || 0;
    this.chatId = this.editedMessage.chat.id;
    this.topicId = this.editedMessage.message_thread_id;
    this.text = this.editedMessage.text;
  }

  /**
   * Reply to the edited message
   * @param messageText Text of the reply
   * @param messageOptions Additional options for sending the message
   */
  async reply(
    messageText: string,
    messageOptions: SendMessageOptions = {},
  ): Promise<Message> {
    return this.bot.sendMessage(this.editedMessage.chat.id, messageText, {
      reply_to_message_id: this.editedMessage.message_id,
      ...messageOptions,
    });
  }

  /**
   * Delete the edited message
   */
  async delete(): Promise<boolean> {
    return this.bot.callApi("deleteMessage", {
      chat_id: this.editedMessage.chat.id,
      message_id: this.editedMessage.message_id,
    });
  }

  /**
   * Send a photo in reply to the edited message
   * @param photo Photo to send (file ID, URL, or File object)
   * @param options Additional options for sending the photo
   */
  async replyWithPhoto(
    photo: string | File,
    options: SendPhotoOptions = {},
  ): Promise<Message> {
    return this.bot.sendPhoto(this.editedMessage.chat.id, photo, {
      reply_to_message_id: this.editedMessage.message_id,
      ...options,
    });
  }

  /**
   * Send a document in reply to the edited message
   * @param document Document to send (file ID, URL, or File object)
   * @param options Additional options for sending the document
   */
  async replyWithDocument(
    document: string | File,
    options: SendDocumentOptions = {},
  ): Promise<Message> {
    return this.bot.sendDocument(this.editedMessage.chat.id, document, {
      reply_to_message_id: this.editedMessage.message_id,
      ...options,
    });
  }

  /**
   * Get information about the chat
   */
  async getChat(): Promise<Chat> {
    return this.bot.callApi("getChat", {
      chat_id: this.editedMessage.chat.id,
    });
  }
}

/**
 * Context class for chat member updates
 */
export class ChatMemberUpdateContextImpl
  extends BaseContextImpl
  implements ChatMemberUpdateContext
{
  chatMemberUpdate: ChatMemberUpdated;
  updateType: "chat_member" | "my_chat_member";

  constructor(
    bot: Bot,
    update: Update,
    updateType: "chat_member" | "my_chat_member",
  ) {
    super(bot, update);
    this.updateType = updateType;
    this.chatMemberUpdate = update[updateType]!;
  }

  /**
   * Get the old status of the chat member
   */
  get oldStatus(): string {
    return this.chatMemberUpdate.old_chat_member.status;
  }

  /**
   * Get the new status of the chat member
   */
  get newStatus(): string {
    return this.chatMemberUpdate.new_chat_member.status;
  }

  /**
   * Check if this is a new member joining the chat
   */
  isJoining(): boolean {
    return (
      (this.oldStatus === "left" || this.oldStatus === "kicked") &&
      (this.newStatus === "member" ||
        this.newStatus === "administrator" ||
        this.newStatus === "restricted")
    );
  }

  /**
   * Check if this is a member leaving the chat
   */
  isLeaving(): boolean {
    return (
      (this.oldStatus === "member" ||
        this.oldStatus === "administrator" ||
        this.oldStatus === "restricted") &&
      (this.newStatus === "left" || this.newStatus === "kicked")
    );
  }

  /**
   * Check if this is a member being promoted
   */
  isPromoted(): boolean {
    return (
      (this.oldStatus === "member" || this.oldStatus === "restricted") &&
      this.newStatus === "administrator"
    );
  }

  /**
   * Check if this is a member being demoted
   */
  isDemoted(): boolean {
    return (
      this.oldStatus === "administrator" &&
      (this.newStatus === "member" || this.newStatus === "restricted")
    );
  }

  /**
   * Get the user who was updated
   */
  get user(): User {
    return this.chatMemberUpdate.new_chat_member.user;
  }

  /**
   * Get the chat where the update occurred
   */
  get chat(): Chat {
    return this.chatMemberUpdate.chat;
  }

  /**
   * Send a message to the chat
   * @param messageText Text of the message
   * @param messageOptions Additional options for sending the message
   */
  async reply(
    messageText: string,
    messageOptions: SendMessageOptions = {},
  ): Promise<Message> {
    return this.bot.sendMessage(
      this.chatMemberUpdate.chat.id,
      messageText,
      messageOptions,
    );
  }

  /**
   * Ban the user from the chat
   * @param untilDate Date when the user will be unbanned (0 or not specified - forever)
   * @param revokeMessages Pass True to delete all messages from the chat for the user
   */
  async banUser(
    untilDate?: number,
    revokeMessages?: boolean,
  ): Promise<boolean> {
    return this.bot.banChatMember(
      this.chatMemberUpdate.chat.id,
      this.user.id,
      untilDate,
      revokeMessages,
    );
  }

  /**
   * Unban the user from the chat
   * @param onlyIfBanned Pass True to unban only if the user is banned
   */
  async unbanUser(onlyIfBanned?: boolean): Promise<boolean> {
    return this.bot.unbanChatMember(
      this.chatMemberUpdate.chat.id,
      this.user.id,
      onlyIfBanned,
    );
  }
}
