import { Message, Update, Chat, ChatMember, ChatPermissions } from "@grammyjs/types";
import { SendMessageOptions, SendPhotoOptions, SendDocumentOptions, ForwardMessageOptions, CopyMessageOptions } from "../types/options";
import { EditedMessageContext } from "../types/context";
import { BotInterface } from "../types/bot";
import { BaseContextImpl } from "./base";


/**
 * Context class for edited message updates
 */

export class EditedMessageContextImpl extends BaseContextImpl implements EditedMessageContext {
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

    constructor(bot: BotInterface, update: Update) {
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
            this.fullName = this.firstName + (this.lastName ? ` ${this.lastName}` : "");

            // Create name property that combines fullName and username
            this.name = this.fullName + (this.username ? ` (@${this.username})` : "");
        }
    }

    /**
     * Reply to the edited message
     * @param messageText Text of the reply
     * @param messageOptions Additional options for sending the message
     */
    async reply(messageText: string, messageOptions: SendMessageOptions = {}): Promise<Message> {
        // Automatically include message_thread_id if it exists and not already specified
        const options: SendMessageOptions = {
            reply_to_message_id: this.editedMessage.message_id,
            ...messageOptions,
        };

        // Add message_thread_id for forum topics if not already specified
        if (this.topicId && !options.message_thread_id) {
            options.message_thread_id = this.topicId;
        }

        return this.bot.sendMessage(this.editedMessage.chat.id, messageText, options);
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
    async replyWithPhoto(photo: string, options: SendPhotoOptions = {}): Promise<Message> {
        // Automatically include message_thread_id if it exists and not already specified
        const photoOptions: SendPhotoOptions = {
            reply_to_message_id: this.editedMessage.message_id,
            ...options,
        };

        // Add message_thread_id for forum topics if not already specified
        if (this.topicId && !photoOptions.message_thread_id) {
            photoOptions.message_thread_id = this.topicId;
        }

        return this.bot.sendPhoto(this.editedMessage.chat.id, photo, photoOptions);
    }

    /**
     * Send a document in reply to the edited message
     * @param document Document to send (file ID, URL, or File object)
     * @param options Additional options for sending the document
     */
    async replyWithDocument(document: string, options: SendDocumentOptions = {}): Promise<Message> {
        // Automatically include message_thread_id if it exists and not already specified
        const docOptions: SendDocumentOptions = {
            reply_to_message_id: this.editedMessage.message_id,
            ...options,
        };

        // Add message_thread_id for forum topics if not already specified
        if (this.topicId && !docOptions.message_thread_id) {
            docOptions.message_thread_id = this.topicId;
        }

        return this.bot.sendDocument(this.editedMessage.chat.id, document, docOptions);
    }

    /**
     * Forward the edited message to another chat
     * @param toChatId Target chat ID to forward the message to
     * @param options Additional options for forwarding the message
     */
    async forwardMessage(toChatId: number | string, options: ForwardMessageOptions = {}): Promise<Message> {
        // Automatically include message_thread_id if specified in options
        const forwardOptions = { ...options };

        return this.bot.forwardMessage(toChatId, this.editedMessage.chat.id, this.editedMessage.message_id, forwardOptions);
    }

    /**
     * Copy the edited message to another chat
     * @param toChatId Target chat ID to copy the message to
     * @param options Additional options for copying the message
     */
    async copyMessage(toChatId: number | string, options: CopyMessageOptions = {}): Promise<{ message_id: number; }> {
        // Automatically include message_thread_id if it exists and not already specified
        const copyOptions: CopyMessageOptions = { ...options };

        return this.bot.copyMessage(toChatId, this.editedMessage.chat.id, this.editedMessage.message_id, copyOptions);
    }

    /**
     * Get information about the chat
     */
    async getChat(): Promise<Chat> {
        return this.bot.callApi("getChat", {
            chat_id: this.editedMessage.chat.id,
        });
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
        return this.bot.restrictChatMember(chatId || this.editedMessage.chat.id, this.userId, permissions, untilDate);
    }

    /**
     * Ban a user from the chat
     * @param userId User ID to ban
     * @param untilDate Date when the user will be unbanned (0 or not specified - forever)
     * @param revokeMessages Pass True to delete all messages from the chat for the user
     */
    async banChatMember(userId: number, untilDate?: number, revokeMessages?: boolean): Promise<boolean> {
        return this.bot.banChatMember(this.editedMessage.chat.id, userId, untilDate, revokeMessages);
    }

    /**
     * Unban a user from the chat
     * @param userId User ID to unban
     * @param onlyIfBanned Pass True to unban only if the user is banned
     */
    async unbanChatMember(userId: number, onlyIfBanned?: boolean): Promise<boolean> {
        return this.bot.unbanChatMember(this.editedMessage.chat.id, userId, onlyIfBanned);
    }
}
