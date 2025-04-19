import { CallbackQuery, Message, Update, ChatMember, ChatPermissions } from "@grammyjs/types";
import { AnswerCallbackQueryOptions, SendMessageOptions } from "../types/options";
import { CallbackQueryContext } from "../types/context";
import { BotInterface } from "../types/bot";
import { BaseContextImpl } from "./base";


/**
 * Context class for callback query updates
 */

export class CallbackQueryContextImpl extends BaseContextImpl implements CallbackQueryContext {
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

    constructor(bot: BotInterface, update: Update) {
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
        this.fullName = this.firstName + (this.lastName ? ` ${this.lastName}` : "");

        // Create name property that combines fullName and username
        this.name = this.fullName + (this.username ? ` (@${this.username})` : "");
    }

    /**
     * Answer the callback query
     * @param text Text to show to the user
     * @param options Additional options for answering the callback query
     */
    async answer(text?: string, options: AnswerCallbackQueryOptions = {}): Promise<boolean> {
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
    async editText(messageText: string, messageOptions: SendMessageOptions = {}): Promise<Message | boolean> {
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
    async editReplyMarkup(replyMarkup: any, options: any = {}): Promise<Message | boolean> {
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
    async reply(messageText: string, messageOptions: SendMessageOptions = {}): Promise<Message> {
        if (!this.message) {
            throw new Error("Cannot reply to message: no message in callback query");
        }

        // Automatically include message_thread_id if it exists and not already specified
        const options: SendMessageOptions = {
            reply_to_message_id: this.message.message_id,
            ...messageOptions,
        };

        // Add message_thread_id for forum topics if not already specified
        if (this.topicId && !options.message_thread_id) {
            options.message_thread_id = this.topicId;
        }

        return this.bot.sendMessage(this.message.chat.id, messageText, options);
    }

    /**
     * Check if a user is a member of a specific chat
     * @param chatId Chat ID to check membership in
     * @param userId User ID to check, defaults to the current user
     * @returns The member's status in the specified chat
     */
    async isChatMemberOf(chatId: number | string): Promise<ChatMember> {
        return this.bot.getChatMember(chatId, this.userId);
    }

    /**
     * Restrict a chat member's permissions
     * @param permissions New permissions for the user
     * @param untilDate Date when restrictions will be lifted (0 or not specified - forever)
     * @param chatId Chat ID to restrict a member
     * @returns True on success
     */
    async restrictChatMember(permissions: ChatPermissions, untilDate?: number, chatId?: number): Promise<boolean> {
        if (!this.message) {
            throw new Error("Cannot restrict chat member: no message in callback query");
        }
        return this.bot.restrictChatMember(chatId || this.message.chat.id, this.userId, permissions, untilDate);
    }

    /**
     * Ban a user from the chat
     * @param userId User ID to ban
     * @param untilDate Date when the user will be unbanned (0 or not specified - forever)
     * @param revokeMessages Pass True to delete all messages from the chat for the user
     */
    async banChatMember(userId: number, untilDate?: number, revokeMessages?: boolean): Promise<boolean> {
        if (!this.message) {
            throw new Error("Cannot ban chat member: no message in callback query");
        }
        return this.bot.banChatMember(this.message.chat.id, userId, untilDate, revokeMessages);
    }

    /**
     * Unban a user from the chat
     * @param userId User ID to unban
     * @param onlyIfBanned Pass True to unban only if the user is banned
     */
    async unbanChatMember(userId: number, onlyIfBanned?: boolean): Promise<boolean> {
        if (!this.message) {
            throw new Error("Cannot unban chat member: no message in callback query");
        }
        return this.bot.unbanChatMember(this.message.chat.id, userId, onlyIfBanned);
    }
}
