import { Message, Update, Chat, ChatMember, ChatPermissions } from "@grammyjs/types";
import { ForumTopic } from "../types";
import { SendMessageOptions, SendPhotoOptions, SendDocumentOptions, ForwardMessageOptions, CopyMessageOptions, CreateForumTopicOptions, EditForumTopicOptions } from "../types/options";
import { MessageContext } from "../types/context";
import { BotInterface } from "../types/bot";
import { BaseContextImpl } from "./base";


/**
 * Context class for message updates
 */

export class MessageContextImpl extends BaseContextImpl implements MessageContext {
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

    constructor(bot: BotInterface, update: Update) {
        super(bot, update);
        this.message = update.message!;
        this.userId = this.message.from?.id || 0;
        this.chatId = this.message.chat.id;
        this.topicId = this.message.message_thread_id;
        this.text = this.message.text!;

        // Set user properties if the message has a sender
        if (this.message.from) {
            this.firstName = this.message.from.first_name;
            this.lastName = this.message.from.last_name;
            this.username = this.message.from.username;

            // Create fullName from first and last name
            this.fullName = this.firstName + (this.lastName ? ` ${this.lastName}` : "");

            // Create name property that combines fullName and username
            this.name = this.fullName + (this.username ? ` (@${this.username})` : "");
        }

        // Parse command if present
        if (this.text && this.text.startsWith("/")) {
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
    async reply(messageText: string, messageOptions: SendMessageOptions = {}): Promise<Message> {
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
     * Edit the current message
     * @param messageText New text for the message
     * @param messageOptions Additional options for editing the message
     */
    async editText(messageText: string, messageOptions: SendMessageOptions = {}): Promise<Message | boolean> {
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
     * @param photo Photo to send (file ID or URL)
     * @param options Additional options for sending the photo
     */
    async replyWithPhoto(photo: string, options: SendPhotoOptions = {}): Promise<Message> {
        // Automatically include message_thread_id if it exists and not already specified
        const photoOptions: SendPhotoOptions = {
            reply_to_message_id: this.message.message_id,
            ...options,
        };

        // Add message_thread_id for forum topics if not already specified
        if (this.topicId && !photoOptions.message_thread_id) {
            photoOptions.message_thread_id = this.topicId;
        }

        return this.bot.sendPhoto(this.message.chat.id, photo, photoOptions);
    }

    /**
     * Send a document in reply to the current message
     * @param document Document to send (file ID, URL, or File object)
     * @param options Additional options for sending the document
     */
    async replyWithDocument(document: string, options: SendDocumentOptions = {}): Promise<Message> {
        // Automatically include message_thread_id if it exists and not already specified
        const docOptions: SendDocumentOptions = {
            reply_to_message_id: this.message.message_id,
            ...options,
        };

        // Add message_thread_id for forum topics if not already specified
        if (this.topicId && !docOptions.message_thread_id) {
            docOptions.message_thread_id = this.topicId;
        }

        return this.bot.sendDocument(this.message.chat.id, document, docOptions);
    }

    /**
     * Forward the current message to another chat
     * @param toChatId Target chat ID to forward the message to
     * @param options Additional options for forwarding the message
     */
    async forwardMessage(toChatId: number | string, options: ForwardMessageOptions = {}): Promise<Message> {
        // Automatically include message_thread_id if specified in options
        const forwardOptions = { ...options };

        return this.bot.forwardMessage(toChatId, this.message.chat.id, this.message.message_id, forwardOptions);
    }

    /**
     * Copy the current message to another chat
     * @param toChatId Target chat ID to copy the message to
     * @param options Additional options for copying the message
     */
    async copyMessage(toChatId: number | string, options: CopyMessageOptions = {}): Promise<{ message_id: number; }> {
        // Automatically include message_thread_id if it exists and not already specified
        const copyOptions: CopyMessageOptions = { ...options };

        return this.bot.copyMessage(toChatId, this.message.chat.id, this.message.message_id, copyOptions);
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
    async banChatMember(userId: number, untilDate?: number, revokeMessages?: boolean): Promise<boolean> {
        return this.bot.banChatMember(this.message.chat.id, userId, untilDate, revokeMessages);
    }

    /**
     * Unban a user from the chat
     * @param userId User ID to unban
     * @param onlyIfBanned Pass True to unban only if the user is banned
     */
    async unbanChatMember(userId: number, onlyIfBanned?: boolean): Promise<boolean> {
        return this.bot.unbanChatMember(this.message.chat.id, userId, onlyIfBanned);
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
        return this.bot.restrictChatMember(chatId || this.message.chat.id, this.userId, permissions, untilDate);
    }

    // Forum topic management methods
    /**
     * Create a new forum topic in the current chat
     * @param name Name for the forum topic
     * @param options Additional options for forum topic creation
     * @returns Information about the created forum topic
     */
    async createForumTopic(name: string, options: CreateForumTopicOptions = {}): Promise<ForumTopic> {
        return this.bot.createForumTopic(this.message.chat.id, name, options);
    }

    /**
     * Edit a forum topic in the current chat
     * @param messageThreadId Identifier of the forum topic
     * @param options Options to update (name and/or icon_custom_emoji_id)
     * @returns True on success
     */
    async editForumTopic(messageThreadId: number, options: EditForumTopicOptions): Promise<boolean> {
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
