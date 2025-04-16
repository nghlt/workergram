import { ChatMemberUpdated, ChatMember, Update, User, Chat, Message, ChatPermissions } from "@grammyjs/types";
import { SendMessageOptions, ChatMemberUpdateContext, BotInterface } from "../types";
import { BaseContextImpl } from "./base";


/**
 * Context class for chat member updates
 */

export class ChatMemberUpdateContextImpl extends BaseContextImpl implements ChatMemberUpdateContext {
    chatMemberUpdate: ChatMemberUpdated;
    updateType: "chat_member";
    userId: number;
    chatId: number | string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    username?: string;
    name?: string;
    oldInfo: ChatMember;
    newInfo: ChatMember;

    constructor(bot: BotInterface, update: Update, updateType: "chat_member") {
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
        this.oldInfo = this.chatMemberUpdate.old_chat_member;
        this.newInfo = this.chatMemberUpdate.new_chat_member;

        // Create fullName from first and last name
        this.fullName = this.firstName + (this.lastName ? ` ${this.lastName}` : "");

        // Create name property that combines fullName and username
        this.name = this.fullName + (this.username ? ` (@${this.username})` : "");
    }

    /**
     * Get the old status of the chat member
     */
    get oldStatus(): "restricted" | "left" | "kicked" | "creator" | "administrator" | "member" | 'banned' {
        return this.chatMemberUpdate.old_chat_member.status;
    }

    /**
     * Get the new status of the chat member
     */
    get newStatus(): "restricted" | "left" | "kicked" | "creator" | "administrator" | "member" {
        return this.chatMemberUpdate.new_chat_member.status;
    }

    /**
     * Check if this is a new member joining the chat
     */
    isJoining(): boolean {
        return (this.oldStatus === "left" || this.oldStatus === "kicked") && (this.newStatus === "member" || this.newStatus === "administrator" || this.newStatus === "restricted");
    }

    /**
     * Check if this is a member leaving the chat
     */
    isLeaving(): boolean {
        return (this.oldStatus === "member" || this.oldStatus === "administrator" || this.oldStatus === "restricted") && (this.newStatus === "left");
    }

    /**
     * Check if this is a member being promoted
     */
    isPromoted(): boolean {
        return (this.oldStatus === "member" || this.oldStatus === "restricted") && this.newStatus === "administrator";
    }

    /**
     * Check if this is a member being demoted
     */
    isDemoted(): boolean {
        return this.oldStatus === "administrator" && (this.newStatus === "member" || this.newStatus === "restricted");
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
    async reply(messageText: string, messageOptions: SendMessageOptions = {}): Promise<Message> {
        return this.bot.sendMessage(this.chatMemberUpdate.chat.id, messageText, messageOptions);
    }

    /**
     * Ban the user from the chat
     * @param untilDate Date when the user will be unbanned (0 or not specified - forever)
     * @param revokeMessages Pass True to delete all messages from the chat for the user
     */
    async banUser(untilDate?: number, revokeMessages?: boolean): Promise<boolean> {
        return this.bot.banChatMember(this.chatMemberUpdate.chat.id, this.user.id, untilDate, revokeMessages);
    }

    /**
     * Unban the user from the chat
     * @param onlyIfBanned Pass True to unban only if the user is banned
     */
    async unbanUser(onlyIfBanned?: boolean): Promise<boolean> {
        return this.bot.unbanChatMember(this.chatMemberUpdate.chat.id, this.user.id, onlyIfBanned);
    }

    /**
     * Restrict a chat member's permissions
     * @param permissions New permissions for the user
     * @param untilDate Date when restrictions will be lifted (0 or not specified - forever)
     * @param chatId Chat ID to restrict a member
     * @returns True on success
     */
    async restrictChatMember(permissions: ChatPermissions, untilDate?: number, chatId?: number): Promise<boolean> {
        return this.bot.restrictChatMember(chatId || this.chatMemberUpdate.chat.id, this.userId, permissions, untilDate);
    }

    /**
     * Check if a user is a member of a specific chat
     * @param chatId Chat ID to check membership in
     * @param userId User ID to check, defaults to the user who triggered the update
     * @returns The member's status in the specified chat
     */
    async isChatMemberOf(chatId: number | string): Promise<ChatMember> {
        return this.bot.getChatMember(chatId, this.userId);
    }
}
