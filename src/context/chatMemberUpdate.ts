/**
 * src/context/chatMemberUpdate.ts
 * Provides ChatMemberUpdateContextImpl for handling 'chat_member' updates in Workergram.
 */

import { ChatMemberUpdated, ChatMember, Update, User, Chat, Message, ChatPermissions } from "@grammyjs/types";
import { SendMessageOptions, ChatMemberUpdateContext, BotInterface, UserInfo, ChatInfo, MemberUpdateInfo } from "../types";
import { BaseContextImpl } from "./base";


/**
 * Context class for chat member updates
 */

export class ChatMemberUpdateContextImpl extends BaseContextImpl implements ChatMemberUpdateContext {
    // Frequently accessed properties at top level
    userId: number;
    chatId: number | string;
    
    // Organized property groups
    user: UserInfo;
    chat: ChatInfo;
    memberUpdate: MemberUpdateInfo;

    constructor(bot: BotInterface, update: Update, updateType: "chat_member") {
        super(bot, update);
        const chatMemberUpdate = update[updateType]!;
        const oldInfo = chatMemberUpdate.old_chat_member;
        const newInfo = chatMemberUpdate.new_chat_member;
        
        // Set top-level properties
        this.userId = newInfo.user.id;
        this.chatId = chatMemberUpdate.chat.id;
        
        // Create user object
        const user = newInfo.user;
        const firstName = user.first_name;
        const lastName = user.last_name;
        const username = user.username;
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
        
        // Create chat object
        this.chat = {
            id: chatMemberUpdate.chat.id,
            type: chatMemberUpdate.chat.type,
            title: chatMemberUpdate.chat.title
        };
        
        // Create member update object
        this.memberUpdate = {
            oldStatus: oldInfo.status,
            newStatus: newInfo.status,
            oldInfo: oldInfo,
            newInfo: newInfo,
            updateType: updateType
        };
    }

    /**
     * Check if the user is joining the chat
     */

    /**
     * Check if the user is joining the chat
     */
    isJoining(): boolean {
        const oldStatus = this.memberUpdate.oldStatus;
        const newStatus = this.memberUpdate.newStatus;
        return (
            oldStatus !== "member" &&
            oldStatus !== "administrator" &&
            oldStatus !== "creator" &&
            (newStatus === "member" || newStatus === "administrator" || newStatus === "creator")
        );
    }

    /**
     * Check if the user is leaving the chat
     */
    isLeaving(): boolean {
        const oldStatus = this.memberUpdate.oldStatus;
        const newStatus = this.memberUpdate.newStatus;
        return (
            (oldStatus === "member" || oldStatus === "administrator" || oldStatus === "creator") &&
            newStatus !== "member" &&
            newStatus !== "administrator" &&
            newStatus !== "creator"
        );
    }

    /**
     * Check if the user is being promoted (becoming admin/creator)
     */
    isPromoted(): boolean {
        const oldStatus = this.memberUpdate.oldStatus;
        const newStatus = this.memberUpdate.newStatus;
        return (
            (oldStatus === "member" && (newStatus === "administrator" || newStatus === "creator")) ||
            (oldStatus === "administrator" && newStatus === "creator")
        );
    }

    /**
     * Check if the user is being demoted (losing admin/creator status)
     */
    isDemoted(): boolean {
        const oldStatus = this.memberUpdate.oldStatus;
        const newStatus = this.memberUpdate.newStatus;
        return (
            (oldStatus === "creator" && (newStatus === "administrator" || newStatus === "member")) ||
            (oldStatus === "administrator" && newStatus === "member")
        );
    }



    /**
     * Send a message to the chat where the status update occurred
     * @param messageText Text of the message
     * @param messageOptions Additional options for sending the message
     * @param asReply Whether to quote the original message (default: false)
     */
    async reply(messageText: string, messageOptions: SendMessageOptions = {}, asReply: boolean = false): Promise<Message> {
        return this.bot.sendMessage(this.chatId, messageText, messageOptions);
    }

    /**
     * Ban a user from the chat
     * @param userId User ID to ban, defaults to the user whose status changed
     * @param untilDate Date when the user will be unbanned, in Unix time
     * @param revokeMessages Pass True to delete all messages from the chat for the user
     */
    async banChatMember(userId?: number, untilDate?: number, revokeMessages?: boolean): Promise<boolean> {
        return this.bot.callApi("banChatMember", {
            chat_id: this.chatId,
            user_id: userId || this.userId,
            until_date: untilDate,
            revoke_messages: revokeMessages,
        });
    }

    /**
     * Unban a user from the chat
     * @param userId User ID to unban, defaults to the user whose status changed
     * @param onlyIfBanned Pass True to unban only if the user is banned
     */
    async unbanChatMember(userId?: number, onlyIfBanned?: boolean): Promise<boolean> {
        return this.bot.callApi("unbanChatMember", {
            chat_id: this.chatId,
            user_id: userId || this.userId,
            only_if_banned: onlyIfBanned,
        });
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
        return this.bot.callApi("restrictChatMember", {
            chat_id: targetChatId,
            user_id: this.userId,
            permissions: permissions,
            until_date: untilDate
        });
    }

    /**
     * Check if a user is a member of a specific chat
     * @param chatId Chat ID to check membership in
     * @param userId User ID to check, defaults to the user who triggered the update
     * @returns The member's status in the specified chat
     */
    async isChatMemberOf(chatId: number | string): Promise<ChatMember> {
        return this.bot.callApi("getChatMember", {
            chat_id: chatId,
            user_id: this.userId
        });
    }
}
