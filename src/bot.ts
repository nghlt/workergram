// Import only the types we actually use directly in this file
import { Update, Message, User, ChatPermissions, WebhookInfo, ForumTopic, ChatMember } from "./types";
import { Sticker } from "./types";
import { ApiResponse } from "./types";
import { SendMessageOptions, SendPhotoOptions, SendDocumentOptions, CopyMessageOptions, AnswerCallbackQueryOptions, SetWebhookOptions, CreateForumTopicOptions, EditForumTopicOptions, MessageHandler, ChatMemberUpdateHandler, GenericHandler, FilterFunction, UpdateType, ApiEndpoints, CallbackQueryHandler } from "./types";
import { filters } from "./filters";
import { ChatMemberUpdateContextImpl } from "./context/chatMemberUpdate";
import { MessageContextImpl } from "./context/message";

/**
 * Main Bot class for interacting with the Telegram Bot API
 */
export class Bot {
  private token: string;
  private baseUrl: string;
  private handlers: Map<
    string,
    Array<{
      handler: any;
      filter?: FilterFunction;
    }>
  >;

  /**
   * Creates a new Bot instance
   * @param token Telegram Bot API token
   * @param update Optional update object from Telegram to process immediately (pre-parsed)
   */
  constructor(token: string, update?: Update) {
    this.token = token;
    this.baseUrl = `https://api.telegram.org/bot${token}`;
    this.handlers = new Map();

    // Process the update if provided
    if (update) {
      this.processUpdate(update).catch((error) => {
        console.error("Error processing update in constructor:", error);
      });
    }
  }

  /**
   * Register a handler for message updates
   */
  onUpdate(event: "message", handler: MessageHandler, filter?: FilterFunction): void;

  /**
   * Register a handler for callback query updates
   */
  onUpdate(event: "callback_query", handler: CallbackQueryHandler, filter?: FilterFunction): void;

  /**
   * Register a handler for chat member updates
   */
  onUpdate(event: "chat_member", handler: ChatMemberUpdateHandler, filter?: FilterFunction): void;

  /**
   * Register a handler for any update type
   */
  onUpdate<T>(event: UpdateType, handler: GenericHandler<T>, filter?: FilterFunction): void;

  /**
   * Implementation of the onUpdate method
   */
  onUpdate(event: UpdateType, handler: (ctx: any) => Promise<any> | any, filter?: FilterFunction): void {
    if (filter?.compatibleEvents && !filter.compatibleEvents.includes(event)) {
      throw new Error(`Filter is not compatible with event "${event}". Allowed: ${filter.compatibleEvents.join(", ")}`);
    }

    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }

    this.handlers.get(event)?.push({
      handler: handler as GenericHandler<any>,
      filter,
    });
  }
  
  
  /**
   * Register a handler for command messages
   * @param command The command to handle (without the leading slash)
   * @param handler The handler function
   * @param filter Additional filter function (optional)
   */
  onCommand(command: string, handler: MessageHandler, filter?: FilterFunction): void {
    // Combine the command filter with any additional filter if provided
    const commandFilter = filters.command(command);
    
    let combinedFilter: FilterFunction | undefined;
    
    if (filter) {
      combinedFilter = (update: Update) => {
        return commandFilter(update) && (filter ? filter(update) : true);
      };
      // Preserve the compatible events property
      combinedFilter.compatibleEvents = ["message"];
    } else {
      combinedFilter = commandFilter;
    }

    // Register the command handler as a message handler with the command filter
    this.onUpdate("message", handler, combinedFilter);
  }

  /**
   * Create the appropriate context for an update
   * @param update The update object
   * @returns The context object
   */
  private createContext(update: Update): any {
    if ("message" in update && update.message) {
      return new MessageContextImpl(this, update);
    } else if ("chat_member" in update && update.chat_member) {
      return new ChatMemberUpdateContextImpl(this, update, "chat_member");
    } else {
      // Generic context for other update types
      return { bot: this, update };
    }
  }

  /**
   * Process an update from Telegram
   * @param update The update object from Telegram
   */
  async processUpdate(update: Update): Promise<void> {
    // Determine the type of update
    const updateTypes = Object.keys(update).filter((key) => key !== "update_id" && (update as any)[key]);

    // Create the appropriate context once for this update
    const ctx = this.createContext(update);

    for (const updateType of updateTypes) {
      // Get the handlers for this update type
      const handlers = this.handlers.get(updateType) || [];

      // Execute each matching handler
      for (const { handler, filter } of handlers) {
        try {
          // Skip this handler if it has a filter and the filter returns false
          if (filter) {
            // Handle function filters
            if (typeof filter === "function") {
              if (!filter(update)) {
                continue;
              }
            }
            // Handle RegExp filters for text matching
            else if (Object.prototype.toString.call(filter) === "[object RegExp]") {
              const text = update.message?.text || update.edited_message?.text || update.callback_query?.data || "";
              if (!(filter as RegExp).test(text)) {
                continue;
              }
            }
            // Handle string filters (for command matching)
            else if (typeof filter === "string") {
              const text = update.message?.text || update.edited_message?.text || "";
              if (!text.startsWith(`/${filter}`)) {
                continue;
              }
            }
            // Handle object filters (criteria matching)
            else if (filter !== null && typeof filter === "object") {
              // Simple deep matching of properties
              const matches = Object.entries(filter as Record<string, any>).every(([key, value]) => {
                const keyParts = key.split(".");
                let current: any = update;

                // Navigate the object path
                for (const part of keyParts) {
                  if (current === undefined || current === null) {
                    return false;
                  }
                  current = current[part];
                }

                // Check if the value matches
                return current === value;
              });

              if (!matches) {
                continue;
              }
            }
          }

          // Execute the handler with the context
          await handler(ctx);
        } catch (error) {
          console.error(`Error in ${updateType} handler:`, error);
        }
      }
    }
  }

  /**
   * Make a call to the Telegram Bot API (public version)
   * @param method The API method to call
   * @param params Parameters for the API call
   * @returns The API response
   */
  async callApi<T>(method: ApiEndpoints, params: Record<string, any> = {}): Promise<T> {
    return this._callApi<T>(method, params);
  }

  /**
   * Make a call to the Telegram Bot API (internal implementation)
   * @param method The API method to call
   * @param params Parameters for the API call
   * @returns The API response
   */
  private async _callApi<T>(method: ApiEndpoints, params: Record<string, any> = {}): Promise<T> {
    const url = `${this.baseUrl}/${method}`;

    // We'll always use JSON for requests, as we've simplified file handling to use strings
    // instead of File objects. FormData is still available through createFormData
    // in the edge cases where it might be needed.
    let response: Response;

    // Use JSON for all requests as we've simplified file handling to use strings
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const result = (await response.json()) as ApiResponse<T>;

    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description || "Unknown error"}`);
    }

    return result.result as T;
  }

  /**
   * Send a message to a chat
   * @param chatId Chat ID to send message to
   * @param text Text of the message
   * @param options Additional options for sending the message
   * @returns The sent message
   */
  async sendMessage(chatId: number | string, text: string, options: SendMessageOptions = {}): Promise<Message> {
    return this._callApi<Message>("sendMessage", {
      chat_id: chatId,
      text,
      ...options,
    });
  }

  /**
   * Forward a message from one chat to another
   * @param chatId Target chat ID
   * @param fromChatId Source chat ID
   * @param messageId Message ID to forward
   * @param options Additional options for forwarding the message
   * @returns The forwarded message
   */
  async forwardMessage(chatId: number | string, fromChatId: number | string, messageId: number, options: any = {}): Promise<Message> {
    return this._callApi<Message>("forwardMessage", {
      chat_id: chatId,
      from_chat_id: fromChatId,
      message_id: messageId,
      ...options,
    });
  }

  /**
   * Copy a message to another chat
   * @param chatId Target chat ID
   * @param fromChatId Source chat ID
   * @param messageId Message ID to copy
   * @param options Additional options for copying the message
   * @returns The message ID of the copied message
   */
  async copyMessage(chatId: number | string, fromChatId: number | string, messageId: number, options?: CopyMessageOptions): Promise<{ message_id: number }> {
    const result = await this.callApi<{ message_id: number }>("copyMessage", {
      chat_id: chatId,
      from_chat_id: fromChatId,
      message_id: messageId,
      ...options,
    });
    return result; // Return the whole object, not just the message_id
  }

  /**
   * Send a photo to a chat
   * @param chatId Chat ID to send photo to
   * @param photo Photo to send (file ID or URL)
   * @param options Additional options for sending the photo
   * @returns The sent message
   */
  async sendPhoto(chatId: number | string, photo: string, options: SendPhotoOptions = {}): Promise<Message> {
    return this._callApi<Message>("sendPhoto", {
      chat_id: chatId,
      photo,
      ...options,
    });
  }

  /**
   * Send a document to a chat
   * @param chatId Chat ID to send document to
   * @param document Document to send (file ID or URL)
   * @param options Additional options for sending the document
   * @returns The sent message
   */
  async sendDocument(chatId: number | string, document: string, options: SendDocumentOptions = {}): Promise<Message> {
    return this._callApi<Message>("sendDocument", {
      chat_id: chatId,
      document,
      ...options,
    });
  }

  /**
   * Answer a callback query
   * @param callbackQueryId Callback query ID to answer
   * @param options Additional options for answering the callback query
   */
  async answerCallbackQuery(callbackQueryId: string, options: AnswerCallbackQueryOptions = {}): Promise<boolean> {
    return this._callApi<boolean>("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      ...options,
    });
  }

  /**
   * Set a webhook for receiving updates
   * @param url URL to send updates to
   * @param options Additional options for setting the webhook
   */
  async setWebhook(url: string, options: SetWebhookOptions = {}): Promise<boolean> {
    return this._callApi<boolean>("setWebhook", {
      url,
      ...options,
    });
  }

  /**
   * Delete the webhook
   * @param dropPendingUpdates Whether to drop all pending updates
   */
  async deleteWebhook(dropPendingUpdates: boolean = false): Promise<boolean> {
    return this._callApi<boolean>("deleteWebhook", {
      drop_pending_updates: dropPendingUpdates,
    });
  }

  /**
   * Get information about the current webhook
   */
  async getWebhookInfo(): Promise<WebhookInfo> {
    return this._callApi<WebhookInfo>("getWebhookInfo");
  }

  /**
   * Get information about the bot
   */
  async getMe(): Promise<User> {
    return this._callApi<User>("getMe");
  }

  /**
   * Get chat member
   * @param chatId Chat ID
   * @param userId User ID
   */
  async getChatMember(chatId: number | string, userId: number): Promise<ChatMember> {
    return this._callApi<ChatMember>("getChatMember", {
      chat_id: chatId,
      user_id: userId,
    });
  }

  /**
   * Ban a chat member
   * @param chatId Chat ID
   * @param userId User ID to ban
   * @param untilDate Date when the user will be unbanned (0 or not specified - forever)
   * @param revokeMessages Pass True to delete all messages from the chat for the user
   */
  async banChatMember(chatId: number | string, userId: number, untilDate: number = 0, revokeMessages: boolean = false): Promise<boolean> {
    return this._callApi<boolean>("banChatMember", {
      chat_id: chatId,
      user_id: userId,
      until_date: untilDate,
      revoke_messages: revokeMessages,
    });
  }

  /**
   * Unban a chat member
   * @param chatId Chat ID
   * @param userId User ID to unban
   */
  async unbanChatMember(chatId: number | string, userId: number, onlyIfBanned: boolean = false): Promise<boolean> {
    return this._callApi<boolean>("unbanChatMember", {
      chat_id: chatId,
      user_id: userId,
      only_if_banned: onlyIfBanned,
    });
  }

  /**
   * Restrict a chat member
   * @param chatId Chat ID
   * @param userId User ID to restrict
   * @param permissions New user permissions
   * @param untilDate Date when restrictions will be lifted (0 or not specified - forever)
   */
  async restrictChatMember(chatId: number | string, userId: number, permissions: ChatPermissions, untilDate: number = 0): Promise<boolean> {
    return this._callApi<boolean>("restrictChatMember", {
      chat_id: chatId,
      user_id: userId,
      permissions,
      until_date: untilDate,
    });
  }

  /**
   * Promote a chat member
   * @param chatId Chat ID
   * @param userId User ID to promote
   * @param options Promotion options
   */
  async promoteChatMember(
    chatId: number | string,
    userId: number,
    options: {
      is_anonymous?: boolean;
      can_manage_chat?: boolean;
      can_post_messages?: boolean;
      can_edit_messages?: boolean;
      can_delete_messages?: boolean;
      can_manage_video_chats?: boolean;
      can_restrict_members?: boolean;
      can_promote_members?: boolean;
      can_change_info?: boolean;
      can_invite_users?: boolean;
      can_pin_messages?: boolean;
      can_manage_topics?: boolean;
    } = {}
  ): Promise<boolean> {
    return this._callApi<boolean>("promoteChatMember", {
      chat_id: chatId,
      user_id: userId,
      ...options,
    });
  }

  /**
   * Set chat administrator custom title
   * @param chatId Chat ID
   * @param userId User ID
   * @param customTitle Custom title for administrator
   */
  async setChatAdministratorCustomTitle(chatId: number | string, userId: number, customTitle: string): Promise<boolean> {
    return this._callApi<boolean>("setChatAdministratorCustomTitle", {
      chat_id: chatId,
      user_id: userId,
      custom_title: customTitle,
    });
  }

  /**
   * Create a new forum topic in a supergroup chat
   * @param chatId Chat ID where to create the forum topic
   * @param name Name of the topic, 1-128 characters
   * @param options Additional options for creating the forum topic
   * @returns Information about the created forum topic
   */
  async createForumTopic(chatId: number | string, name: string, options: CreateForumTopicOptions = {}): Promise<ForumTopic> {
    return this._callApi<ForumTopic>("createForumTopic", {
      chat_id: chatId,
      name,
      ...options,
    });
  }

  /**
   * Edit a forum topic in a supergroup chat
   * @param chatId Chat ID where the forum topic exists
   * @param messageThreadId Identifier of the forum topic
   * @param options Options to update (name and/or icon_custom_emoji_id)
   * @returns True on success
   */
  async editForumTopic(chatId: number | string, messageThreadId: number, options: EditForumTopicOptions): Promise<boolean> {
    return this._callApi<boolean>("editForumTopic", {
      chat_id: chatId,
      message_thread_id: messageThreadId,
      ...options,
    });
  }

  /**
   * Close an open forum topic
   * @param chatId Chat ID where the forum topic exists
   * @param messageThreadId Identifier of the forum topic
   * @returns True on success
   */
  async closeForumTopic(chatId: number | string, messageThreadId: number): Promise<boolean> {
    return this._callApi<boolean>("closeForumTopic", {
      chat_id: chatId,
      message_thread_id: messageThreadId,
    });
  }

  /**
   * Reopen a closed forum topic
   * @param chatId Chat ID where the forum topic exists
   * @param messageThreadId Identifier of the forum topic
   * @returns True on success
   */
  async reopenForumTopic(chatId: number | string, messageThreadId: number): Promise<boolean> {
    return this._callApi<boolean>("reopenForumTopic", {
      chat_id: chatId,
      message_thread_id: messageThreadId,
    });
  }

  /**
   * Delete a forum topic along with all its messages
   * @param chatId Chat ID where the forum topic exists
   * @param messageThreadId Identifier of the forum topic
   * @returns True on success
   */
  async deleteForumTopic(chatId: number | string, messageThreadId: number): Promise<boolean> {
    return this._callApi<boolean>("deleteForumTopic", {
      chat_id: chatId,
      message_thread_id: messageThreadId,
    });
  }

  /**
   * Unpin all messages in a forum topic
   * @param chatId Chat ID where the forum topic exists
   * @param messageThreadId Identifier of the forum topic
   * @returns True on success
   */
  async unpinAllForumTopicMessages(chatId: number | string, messageThreadId: number): Promise<boolean> {
    return this._callApi<boolean>("unpinAllForumTopicMessages", {
      chat_id: chatId,
      message_thread_id: messageThreadId,
    });
  }

  /**
   * Hide the 'General' topic in a forum supergroup chat
   * @param chatId Chat ID where to hide the general forum topic
   * @returns True on success
   */
  async hideGeneralForumTopic(chatId: number | string): Promise<boolean> {
    return this._callApi<boolean>("hideGeneralForumTopic", {
      chat_id: chatId,
    });
  }

  /**
   * Unhide the 'General' topic in a forum supergroup chat
   * @param chatId Chat ID where to unhide the general forum topic
   * @returns True on success
   */
  async unhideGeneralForumTopic(chatId: number | string): Promise<boolean> {
    return this._callApi<boolean>("unhideGeneralForumTopic", {
      chat_id: chatId,
    });
  }

  /**
   * Get custom emoji stickers that can be used as forum topic icons
   * @returns Array of stickers that can be used as forum topic icons
   */
  async getForumTopicIconStickers(): Promise<Sticker[]> {
    return this._callApi<Sticker[]>("getForumTopicIconStickers");
  }
}
