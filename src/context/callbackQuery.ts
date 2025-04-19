import { CallbackQuery, Message, Update, ChatMember, ChatPermissions } from "@grammyjs/types";
import { AnswerCallbackQueryOptions, SendMessageOptions } from "../types/options";
import { CallbackQueryContext, UserInfo, ChatInfo, MessageInfo, CallbackInfo } from "../types/context";
import { BotInterface } from "../types/bot";
import { BaseContextImpl } from "./base";


/**
 * Context class for callback query updates
 */

export class CallbackQueryContextImpl extends BaseContextImpl implements CallbackQueryContext {
    // Frequently accessed properties at top level
    userId: number;
    chatId?: number | string;
    messageId?: number;
    callbackData?: string;
    
    // Organized property groups
    user: UserInfo;
    chat?: ChatInfo;
    message?: MessageInfo;
    callback: CallbackInfo;

    constructor(bot: BotInterface, update: Update) {
        super(bot, update);
        const callbackQuery = update.callback_query!;
        const originalMessage = callbackQuery.message;
        
        // Set top-level properties
        this.userId = callbackQuery.from.id;
        this.chatId = originalMessage?.chat.id;
        this.messageId = originalMessage?.message_id;
        this.callbackData = callbackQuery.data;
        
        // Create user object
        const firstName = callbackQuery.from.first_name;
        const lastName = callbackQuery.from.last_name;
        const username = callbackQuery.from.username;
        const fullName = firstName + (lastName ? ` ${lastName}` : "");
        const displayName = fullName + (username ? ` (@${username})` : "");
        
        this.user = {
            id: this.userId,
            firstName,
            lastName,
            fullName,
            username,
            displayName
        };
        
        // Create chat object if message exists
        if (originalMessage) {
            this.chat = {
                id: originalMessage.chat.id,
                topicId: originalMessage.message_thread_id,
                type: originalMessage.chat.type,
                title: originalMessage.chat.title
            };
            
            // Create message object
            this.message = {
                id: originalMessage.message_id,
                text: originalMessage.text,
                date: originalMessage.date,
                isEdited: false
            };
        }
        
        // Create callback object
        this.callback = {
            id: callbackQuery.id,
            data: callbackQuery.data,
            gameShortName: callbackQuery.game_short_name,
            inlineMessageId: callbackQuery.inline_message_id,
            chatInstance: callbackQuery.chat_instance
        };
    }

    /**
     * Answer the callback query
     * @param text Text to show to the user
     * @param options Additional options for answering the callback query
     */
    async answer(text?: string, options: AnswerCallbackQueryOptions = {}): Promise<boolean> {
        return this.bot.answerCallbackQuery(this.callback.id, {
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
        if (!this.chatId || !this.messageId) {
            throw new Error("Cannot edit message: no message in callback query");
        }

        return this.bot.callApi("editMessageText", {
            chat_id: this.chatId,
            message_id: this.messageId,
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
        if (!this.chatId || !this.messageId) {
            throw new Error("Cannot edit message: no message in callback query");
        }

        return this.bot.callApi("editMessageReplyMarkup", {
            chat_id: this.chatId,
            message_id: this.messageId,
            reply_markup: replyMarkup,
            ...options,
        });
    }

    /**
     * Delete the associated message
     */
    async deleteMessage(): Promise<boolean> {
        if (!this.chatId || !this.messageId) {
            throw new Error("Cannot delete message: no message in callback query");
        }

        return this.bot.callApi("deleteMessage", {
            chat_id: this.chatId,
            message_id: this.messageId,
        });
    }

    /**
     * Reply to the associated message
     * @param messageText Text of the reply
     * @param messageOptions Additional options for sending the message
     */
    async reply(messageText: string, messageOptions: SendMessageOptions = {}, asReply: boolean = false): Promise<Message> {
        if (!this.chatId) {
            throw new Error("Cannot reply to message: no chat in callback query");
        }

        // Create options object
        const options: SendMessageOptions = { ...messageOptions };
        
        // Automatically include reply_to_message_id if asReply is true and we have a messageId
        if (asReply && this.messageId) {
            options.reply_to_message_id = this.messageId;
        }

        // Add message_thread_id for forum topics if not already specified
        if (this.chat?.topicId && !options.message_thread_id) {
            options.message_thread_id = this.chat.topicId;
        }

        return this.bot.sendMessage(this.chatId, messageText, options);
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
        const targetChatId = chatId || this.chatId;
        if (!targetChatId) {
            throw new Error("Cannot restrict chat member: no chat in callback query");
        }
        return this.bot.restrictChatMember(targetChatId, this.userId, permissions, untilDate);
    }

    /**
     * Ban a user from the chat
     * @param userId User ID to ban
     * @param untilDate Date when the user will be unbanned (0 or not specified - forever)
     * @param revokeMessages Pass True to delete all messages from the chat for the user
     */
    async banChatMember(userId: number, untilDate?: number, revokeMessages?: boolean): Promise<boolean> {
        if (!this.chatId) {
            throw new Error("Cannot ban chat member: no chat in callback query");
        }
        return this.bot.banChatMember(this.chatId, userId, untilDate, revokeMessages);
    }

    /**
     * Unban a user from the chat
     * @param userId User ID to unban
     * @param onlyIfBanned Pass True to unban only if the user is banned
     */
    async unbanChatMember(userId: number, onlyIfBanned?: boolean): Promise<boolean> {
        if (!this.chatId) {
            throw new Error("Cannot unban chat member: no chat in callback query");
        }
        return this.bot.unbanChatMember(this.chatId, userId, onlyIfBanned);
    }
}
