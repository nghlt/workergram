import { Message, Update, Chat, ChatMember, ChatPermissions } from "@grammyjs/types";
import { ForumTopic } from "../types";
import { SendMessageOptions, SendPhotoOptions, SendDocumentOptions, ForwardMessageOptions, CopyMessageOptions, CreateForumTopicOptions, EditForumTopicOptions } from "../types/options";
import { MessageContext, ChatInfo, MessageInfo } from "../types/context";
import { BotInterface } from "../types/bot";
import { BaseContextImpl } from "./base";


/**
 * Context class for message updates
 */

export class MessageContextImpl extends BaseContextImpl implements MessageContext {
    // Frequently accessed properties at top level
    chatId: number | string;
    messageId: number;
    text: string;
    
    // Organized property groups
    chat: ChatInfo;
    message: MessageInfo;

    constructor(bot: BotInterface, update: Update) {
        super(bot, update);
        const message = update.message!;

        // Set top-level properties
        this.chatId = message.chat.id;
        this.messageId = message.message_id;
        this.text = message.text || "";
        
        // Initialize chat object
        this.chat = {
            id: message.chat.id,
            topicId: message.message_thread_id,
            type: message.chat.type,
            title: message.chat.title
        };
        
        // Initialize message info object
        const messageData = message;
        const messageType = messageData.text ? "text" : 
                          messageData.photo ? "photo" : 
                          messageData.video ? "video" : 
                          messageData.document ? "document" : 
                          messageData.audio ? "audio" : 
                          messageData.voice ? "voice" : 
                          messageData.animation ? "animation" : 
                          messageData.sticker ? "sticker" : 
                          "other";
        
        // Parse command if present and initialize message info
        let command: string | undefined = undefined;
        let commandPayload: string | undefined = undefined;
        
        if (this.text && this.text.startsWith("/")) {
            const commandMatch = this.text.match(/^\/([a-zA-Z0-9_]+)(?:@\w+)?(?:\s+(.*))?$/);
            if (commandMatch) {
                command = commandMatch[1];
                commandPayload = commandMatch[2];
            }
        }
        
        this.message = {
            id: this.messageId,
            text: this.text,
            command,
            commandPayload,
            date: message.date,
            isEdited: false
        };
    }

    /**
     * Reply to the current message
     * @param messageText Text of the reply
     * @param messageOptions Additional options for sending the message
     * @param asReply Whether to quote the original message (default: false)
     */
    async reply(messageText: string, messageOptions: SendMessageOptions = {}, asReply: boolean = false): Promise<Message> {
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
     * Edit the current message
     * @param messageText New text for the message
     * @param messageOptions Additional options for editing the message
     */
    async editText(messageText: string, messageOptions: SendMessageOptions = {}): Promise<Message | boolean> {
        return this.bot.callApi("editMessageText", {
            chat_id: this.chatId,
            message_id: this.messageId,
            text: messageText,
            ...messageOptions,
        });
    }

    /**
     * Delete the current message
     */
    async deleteMessage(): Promise<boolean> {
        return this.bot.callApi("deleteMessage", {
            chat_id: this.chatId,
            message_id: this.messageId,
        });
    }

    /**
     * Send a photo in reply to the current message
     * @param photo Photo to send (file ID or URL)
     * @param options Additional options for sending the photo
     * @param asReply Whether to quote the original message (default: false)
     */
    async replyWithPhoto(photo: string, options: SendPhotoOptions = {}, asReply: boolean = false): Promise<Message> {
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
     * Send a document in reply to the current message
     * @param document Document to send (file ID, URL, or File object)
     * @param options Additional options for sending the document
     * @param asReply Whether to quote the original message (default: false)
     */
    async replyWithDocument(document: string, options: SendDocumentOptions = {}, asReply: boolean = false): Promise<Message> {
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
     * Forward the current message to another chat
     * @param toChatId Target chat ID to forward the message to
     * @param options Additional options for forwarding the message
     */
    async forwardMessage(toChatId: number | string, options: ForwardMessageOptions = {}): Promise<Message> {
        // Automatically include message_thread_id if specified in options
        const forwardOptions = { ...options };

        return this.bot.forwardMessage(toChatId, this.chatId, this.messageId, forwardOptions);
    }

    /**
     * Copy the current message to another chat
     * @param toChatId Target chat ID to copy the message to
     * @param options Additional options for copying the message
     */
    async copyMessage(toChatId: number | string, options: CopyMessageOptions = {}): Promise<{ message_id: number; }> {
        // Automatically include message_thread_id if it exists and not already specified
        const copyOptions: CopyMessageOptions = { ...options };

        return this.bot.copyMessage(toChatId, this.chatId, this.messageId, copyOptions);
    }

    /**
     * Get information about the chat
     */
    async getChat(): Promise<Chat> {
        return this.bot.callApi("getChat", {
            chat_id: this.chatId,
        });
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
        return this.bot.restrictChatMember(chatId || this.chatId, this.userId, permissions, untilDate);
    }

    // Forum topic management methods
    /**
     * Delete a forum topic along with all its messages
     * @param messageThreadId Identifier of the forum topic
     * @returns True on success
     */
    async deleteForumTopic(messageThreadId: number): Promise<boolean> {
        return this.bot.callApi("deleteForumTopic", {
            chat_id: this.chatId,
            message_thread_id: messageThreadId
        });
    }

    /**
     * Create a new forum topic in the current chat
     * @param name Name for the forum topic
     * @param options Additional options for forum topic creation
     * @returns Information about the created forum topic
     */
    async createForumTopic(name: string, options: CreateForumTopicOptions = {}): Promise<ForumTopic> {
        return this.bot.callApi("createForumTopic", {
            chat_id: this.chatId,
            name,
            ...options
        });
    }

    /**
     * Edit a forum topic in the current chat
     * @param messageThreadId Identifier of the forum topic
     * @param options Options to update (name and/or icon_custom_emoji_id)
     * @returns True on success
     */
    async editForumTopic(messageThreadId: number, options: EditForumTopicOptions): Promise<boolean> {
        return this.bot.callApi("editForumTopic", {
            chat_id: this.chatId,
            message_thread_id: messageThreadId,
            ...options
        });
    }

    /**
     * Close an open forum topic
     * @param messageThreadId Identifier of the forum topic
     * @returns True on success
     */
    async closeForumTopic(messageThreadId: number): Promise<boolean> {
        return this.bot.callApi("closeForumTopic", {
            chat_id: this.chatId,
            message_thread_id: messageThreadId
        });
    }

    /**
     * Reopen a closed forum topic
     * @param messageThreadId Identifier of the forum topic
     * @returns True on success
     */
    async reopenForumTopic(messageThreadId: number): Promise<boolean> {
        return this.bot.callApi("reopenForumTopic", {
            chat_id: this.chatId,
            message_thread_id: messageThreadId
        });
    }

    /**
     * Unpin all messages in a forum topic
     * @param messageThreadId Identifier of the forum topic
     * @returns True on success
     */
    async unpinAllForumTopicMessages(messageThreadId: number): Promise<boolean> {
        return this.bot.callApi("unpinAllForumTopicMessages", {
            chat_id: this.chatId,
            message_thread_id: messageThreadId
        });
    }

    /**
     * Hide the 'General' topic in a forum supergroup chat
     * @returns True on success
     */
    async hideGeneralForumTopic(): Promise<boolean> {
        return this.bot.callApi("hideGeneralForumTopic", {
            chat_id: this.chatId
        });
    }

    /**
     * Unhide the 'General' topic in a forum supergroup chat
     * @returns True on success
     */
    async unhideGeneralForumTopic(): Promise<boolean> {
        return this.bot.callApi("unhideGeneralForumTopic", {
            chat_id: this.chatId
        });
    }
}
