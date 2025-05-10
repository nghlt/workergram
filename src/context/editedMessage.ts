/**
 * src/context/editedMessage.ts
 * Provides EditedMessageContextImpl for handling 'edited_message' updates in Workergram.
 */

import { Update, Chat, ChatMember, ChatPermissions } from "@grammyjs/types";
import { SendMessageOptions, SendPhotoOptions, SendDocumentOptions, ForwardMessageOptions, CopyMessageOptions, EditedMessageContext, UserInfo, ChatInfo, MessageInfo, BotInterface } from "../types";
import { BaseContextImpl } from "./base";
import { MessageInstance } from "../wrappers/messageInstance";
import { determineMessageType } from "../utils";

/**
 * Context class for edited message updates
 */

export class EditedMessageContextImpl extends BaseContextImpl implements EditedMessageContext {
    // Frequently accessed properties at top level
    userId: number;
    chatId: number | string;
    messageId: number;
    text?: string;
    
    // Organized property groups
    user: UserInfo;
    chat: ChatInfo;
    message: MessageInfo;

    constructor(bot: BotInterface, update: Update) {
        super(bot, update);
        const editedMessage = update.edited_message!;
        
        // Set top-level properties
        this.userId = editedMessage.from?.id || 0;
        this.chatId = editedMessage.chat.id;
        this.messageId = editedMessage.message_id;
        this.text = editedMessage.text;
        
        // Create user object
        this.user = {
            id: this.userId,
            firstName: undefined,
            lastName: undefined,
            fullName: undefined,
            username: undefined,
            displayName: undefined
        };
        
        if (editedMessage.from) {
            const firstName = editedMessage.from.first_name;
            const lastName = editedMessage.from.last_name;
            const username = editedMessage.from.username;
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
        }
        
        // Create chat object
        this.chat = {
            id: editedMessage.chat.id,
            topicId: editedMessage.message_thread_id,
            type: editedMessage.chat.type,
            title: editedMessage.chat.title,
            isForum: editedMessage.chat.is_forum || false
        };
        
        // Create message object
        this.message = {
            id: editedMessage.message_id,
            text: editedMessage.text,
            date: editedMessage.date,
            isEdited: true, // This is an edited message
            type: determineMessageType(editedMessage)
        };
    }

    /**
     * Reply to the edited message
     * @param messageText Text of the reply
     * @param messageOptions Additional options for sending the message
     * @param asReply Whether to quote the original message (default: false)
     */
    async reply(messageText: string, messageOptions: SendMessageOptions = {}, asReply: boolean = false): Promise<MessageInstance> {
        // Create options object
        const options: SendMessageOptions = { ...messageOptions };
        
        // Automatically include reply_to_message_id if asReply is true
        if (asReply) {
            options.reply_to_message_id = this.messageId;
        }

        // Add message_thread_id for forum topics if not already specified
        if (this.chat.topicId && !options.message_thread_id) {
            options.message_thread_id = this.chat.topicId;
        }

        return this.bot.sendMessage(this.chatId, messageText, options);
    }

    /**
     * Delete the edited message
     */
    async deleteMessage(): Promise<boolean> {
        return this.bot.callApi("deleteMessage", {
            chat_id: this.chatId,
            message_id: this.messageId,
        });
    }

    /**
     * Send a photo in reply to the edited message
     * @param photo Photo to send (file ID, URL, or File object)
     * @param options Additional options for sending the photo
     * @param asReply Whether to quote the original message (default: false)
     */
    async replyWithPhoto(photo: string, options: SendPhotoOptions = {}, asReply: boolean = false): Promise<MessageInstance> {
        // Create options object
        const photoOptions: SendPhotoOptions = { ...options };
        
        // Automatically include reply_to_message_id if asReply is true
        if (asReply) {
            photoOptions.reply_to_message_id = this.messageId;
        }

        // Add message_thread_id for forum topics if not already specified
        if (this.chat.topicId && !photoOptions.message_thread_id) {
            photoOptions.message_thread_id = this.chat.topicId;
        }

        return this.bot.sendPhoto(this.chatId, photo, photoOptions);
    }

    /**
     * Send a document in reply to the edited message
     * @param document Document to send (file ID, URL, or File object)
     * @param options Additional options for sending the document
     * @param asReply Whether to quote the original message (default: false)
     */
    async replyWithDocument(document: string, options: SendDocumentOptions = {}, asReply: boolean = false): Promise<MessageInstance> {
        // Create options object
        const docOptions: SendDocumentOptions = { ...options };
        
        // Automatically include reply_to_message_id if asReply is true
        if (asReply) {
            docOptions.reply_to_message_id = this.messageId;
        }

        // Add message_thread_id for forum topics if not already specified
        if (this.chat.topicId && !docOptions.message_thread_id) {
            docOptions.message_thread_id = this.chat.topicId;
        }

        return this.bot.sendDocument(this.chatId, document, docOptions);
    }

    /**
     * Forward the edited message to another chat
     * @param toChatId Target chat ID to forward the message to
     * @param options Additional options for forwarding the message
     */
    async forwardMessage(toChatId: number | string, options: ForwardMessageOptions = {}): Promise<MessageInstance> {
        return this.bot.forwardMessage(toChatId, this.chatId, this.messageId, options);
    }

    /**
     * Copy the edited message to another chat
     * @param toChatId Target chat ID to copy the message to
     * @param options Additional options for copying the message
     */
    async copyMessage(toChatId: number | string, options: CopyMessageOptions = {}): Promise<{ message_id: number; }> {
        return this.bot.copyMessage(toChatId, this.chatId, this.messageId, options);
    }

    /**
     * Get information about the chat
     */
    async getChat(): Promise<Chat> {
        return this.bot.callApi("getChat", {
            chat_id: this.chatId
        });
    }

    /**
     * Check if a user is a member of a specific chat
     * @param chatId Chat ID to check membership in
     * @param userId User ID to check, defaults to the current user
     * @returns The member's status in the specified chat
     */
    async isChatMemberOf(chatId: number | string, userId?: number): Promise<ChatMember> {
        return this.bot.getChatMember(chatId, userId || this.userId);
    }

    /**
     * Restrict a chat member's permissions
     * @param permissions New permissions for the user
     * @param untilDate Date when restrictions will be lifted (0 or not specified - forever)
     * @param chatId Chat ID to restrict a member
     * @returns True on success
     */
    async restrictChatMember(permissions: ChatPermissions, untilDate?: number, chatId?: number): Promise<boolean> {
        return this.bot.restrictChatMember(chatId || this.chatId, this.userId, permissions, untilDate);
    }

    /**
     * Ban a user from the chat
     * @param userId User ID to ban
     * @param untilDate Date when the user will be unbanned (0 or not specified - forever)
     * @param revokeMessages Pass True to delete all messages from the chat for the user
     */
    async banChatMember(userId: number, untilDate?: number, revokeMessages?: boolean): Promise<boolean> {
        return this.bot.banChatMember(this.chatId, userId, untilDate, revokeMessages);
    }

    /**
     * Unban a user from the chat
     * @param userId User ID to unban
     * @param onlyIfBanned Pass True to unban only if the user is banned
     */
    async unbanChatMember(userId: number, onlyIfBanned?: boolean): Promise<boolean> {
        return this.bot.unbanChatMember(this.chatId, userId, onlyIfBanned);
    }
}
