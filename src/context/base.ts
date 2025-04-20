/**
 * src/context/base.ts
 * Provides BaseContextImpl: base implementation for all update contexts,
 * initializing common properties and extracting user information.
 */
import { Update, User } from "@grammyjs/types";
import { BaseContext, UserInfo } from "../types/context";
import { BotInterface } from "../types/bot";


/**
 * Base context class for all update types
 */

export class BaseContextImpl implements BaseContext {
    // Common properties for all contexts
    bot: BotInterface;
    update: Update;
    
    // Common user information
    userId: number;
    user: UserInfo;

    constructor(bot: BotInterface, update: Update) {
        this.bot = bot;
        this.update = update;
        
        // Initialize with defaults
        this.userId = 0;
        this.user = {
            id: 0,
            firstName: undefined,
            lastName: undefined,
            fullName: "",
            username: undefined,
            displayName: ""
        };
        
        // Try to find a user in the update
        const user = this.extractUserFromUpdate(update);
        if (user) {
            this.userId = user.id;
            const firstName = user.first_name;
            const lastName = user.last_name;
            const username = user.username;
            const fullName = firstName + (lastName ? ` ${lastName}` : "");
            const displayName = fullName + (username ? ` (@${username})` : "");
            
            this.user = {
                id: user.id,
                firstName,
                lastName,
                fullName,
                username,
                displayName
            };
        }
    }

    /**
     * Extract a user from any update type
     * @param update The update object
     * @returns User object if found, undefined otherwise
     * @private
     */
    private extractUserFromUpdate(update: Update): User | undefined {
        // Check all possible update types that contain a user
        if (update.message) {
            return update.message.from;
        } else if (update.edited_message) {
            return update.edited_message.from;
        } else if (update.callback_query) {
            return update.callback_query.from;
        } else if (update.inline_query) {
            return update.inline_query.from;
        } else if (update.channel_post) {
            return update.channel_post.from;
        } else if (update.edited_channel_post) {
            return update.edited_channel_post.from;
        } else if (update.chat_member) {
            return update.chat_member.from;
        } else if (update.my_chat_member) {
            return update.my_chat_member.from;
        } else if (update.chosen_inline_result) {
            return update.chosen_inline_result.from;
        } else if (update.shipping_query) {
            return update.shipping_query.from;
        } else if (update.pre_checkout_query) {
            return update.pre_checkout_query.from;
        } else if (update.poll_answer) {
            return update.poll_answer.user;
        }
        
        return undefined;
    }
}
