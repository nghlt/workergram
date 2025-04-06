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
  CreateForumTopicOptions,
  EditForumTopicOptions,
  ForumTopic,
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
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  name?: string;

  constructor(bot: Bot, update: Update) {
    super(bot, update);
    this.message = update.message!;
    this.userId = this.message.from?.id || 0;
    this.chatId = this.message.chat.id;
    this.topicId = this.message.message_thread_id;
    this.text = this.message.text;

    // Set user properties if the message has a sender
    if (this.message.from) {
      this.firstName = this.message.from.first_name;
      this.lastName = this.message.from.last_name;
      this.username = this.message.from.username;
      
      // Create fullName from first and last name
      this.fullName = this.firstName + (this.lastName ? ` ${this.lastName}` : '');
      
      // Create name property that combines fullName and username
      this.name = this.fullName + (this.username ? ` (@${this.username})` : '');
    }

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

  // Forum topic management methods
  
  /**
   * Create a new forum topic in the current chat
   * @param name Name for the forum topic
   * @param options Additional options for forum topic creation
   * @returns Information about the created forum topic
   */
  async createForumTopic(
    name: string,
    options: CreateForumTopicOptions = {},
  ): Promise<ForumTopic> {
    return this.bot.createForumTopic(this.message.chat.id, name, options);
  }

  /**
   * Edit a forum topic in the current chat
   * @param messageThreadId Identifier of the forum topic
   * @param options Options to update (name and/or icon_custom_emoji_id)
   * @returns True on success
   */
  async editForumTopic(
    messageThreadId: number,
    options: EditForumTopicOptions,
  ): Promise<boolean> {
    return this.bot.editForumTopic(this.message.chat.id, messageThreadId, options);
  }

  /**
   * Close an open forum topic
   * @param messageThreadId Identifier of the forum topic
   * @returns True on success
   */
  async closeForumTopic(messageThreadId: number): Promise<boolean> {
    return this.bot.closeForumTopic(this.message.chat.id, messageThreadId);
  }

  /**
   * Reopen a closed forum topic
   * @param messageThreadId Identifier of the forum topic
   * @returns True on success
   */
  async reopenForumTopic(messageThreadId: number): Promise<boolean> {
    return this.bot.reopenForumTopic(this.message.chat.id, messageThreadId);
  }

  /**
   * Delete a forum topic along with all its messages
   * @param messageThreadId Identifier of the forum topic
   * @returns True on success
   */
  async deleteForumTopic(messageThreadId: number): Promise<boolean> {
    return this.bot.deleteForumTopic(this.message.chat.id, messageThreadId);
  }

  /**
   * Unpin all messages in a forum topic
   * @param messageThreadId Identifier of the forum topic
   * @returns True on success
   */
  async unpinAllForumTopicMessages(messageThreadId: number): Promise<boolean> {
    return this.bot.unpinAllForumTopicMessages(this.message.chat.id, messageThreadId);
  }

  /**
   * Hide the 'General' topic in a forum supergroup chat
   * @returns True on success
   */
  async hideGeneralForumTopic(): Promise<boolean> {
    return this.bot.hideGeneralForumTopic(this.message.chat.id);
  }

  /**
   * Unhide the 'General' topic in a forum supergroup chat
   * @returns True on success
   */
  async unhideGeneralForumTopic(): Promise<boolean> {
    return this.bot.unhideGeneralForumTopic(this.message.chat.id);
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
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  name?: string;

  constructor(bot: Bot, update: Update) {
    super(bot, update);
    this.callbackQuery = update.callback_query!;
    this.message = this.callbackQuery.message;
    this.userId = this.callbackQuery.from.id;
    this.chatId = this.message?.chat.id;
    this.topicId = this.message?.message_thread_id;
    this.callbackData = this.callbackQuery.data;
    
    // Set user properties from the user who sent the callback query
    this.firstName = this.callbackQuery.from.first_name;
    this.lastName = this.callbackQuery.from.last_name;
    this.username = this.callbackQuery.from.username;
    
    // Create fullName from first and last name
    this.fullName = this.firstName + (this.lastName ? ` ${this.lastName}` : '');
    
    // Create name property that combines fullName and username
    this.name = this.fullName + (this.username ? ` (@${this.username})` : '');
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
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  name?: string;

  constructor(bot: Bot, update: Update) {
    super(bot, update);
    this.editedMessage = update.edited_message!;
    this.userId = this.editedMessage.from?.id || 0;
    this.chatId = this.editedMessage.chat.id;
    this.topicId = this.editedMessage.message_thread_id;
    this.text = this.editedMessage.text;
    
    // Set user properties if the message has a sender
    if (this.editedMessage.from) {
      this.firstName = this.editedMessage.from.first_name;
      this.lastName = this.editedMessage.from.last_name;
      this.username = this.editedMessage.from.username;
      
      // Create fullName from first and last name
      this.fullName = this.firstName + (this.lastName ? ` ${this.lastName}` : '');
      
      // Create name property that combines fullName and username
      this.name = this.fullName + (this.username ? ` (@${this.username})` : '');
    }
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
  userId: number;
  chatId: number | string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  name?: string;

  constructor(
    bot: Bot,
    update: Update,
    updateType: "chat_member" | "my_chat_member",
  ) {
    super(bot, update);
    this.updateType = updateType;
    this.chatMemberUpdate = update[updateType]!;
    
    // Set user and chat IDs
    this.userId = this.chatMemberUpdate.new_chat_member.user.id;
    this.chatId = this.chatMemberUpdate.chat.id;
    
    // Set user properties from the user being updated
    const user = this.chatMemberUpdate.new_chat_member.user;
    this.firstName = user.first_name;
    this.lastName = user.last_name;
    this.username = user.username;
    
    // Create fullName from first and last name
    this.fullName = this.firstName + (this.lastName ? ` ${this.lastName}` : '');
    
    // Create name property that combines fullName and username
    this.name = this.fullName + (this.username ? ` (@${this.username})` : '');
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
