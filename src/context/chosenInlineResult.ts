import { ChosenInlineResult, Update, ChatMember } from "@grammyjs/types";
import { ChosenInlineResultContext, UserInfo, ChosenInlineResultInfo } from "../types/context";
import { BotInterface } from "../types";
import { BaseContextImpl } from "./base";

/**
 * Context class for chosen_inline_result updates
 */
export class ChosenInlineResultContextImpl extends BaseContextImpl implements ChosenInlineResultContext {
    // Frequently accessed properties at top level
    userId: number;
    resultId: string;
    query: string;
    
    // Organized property groups
    user: UserInfo;
    chosenResult: ChosenInlineResultInfo;

    constructor(bot: BotInterface, update: Update) {
        super(bot, update);
        const chosenInlineResultData = update.chosen_inline_result!;
        
        // Set top-level properties
        this.resultId = chosenInlineResultData.result_id;
        this.query = chosenInlineResultData.query;
        this.userId = chosenInlineResultData.from.id;
        
        // Create user object
        const from = chosenInlineResultData.from;
        const firstName = from.first_name;
        const lastName = from.last_name;
        const username = from.username;
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
        
        // Create chosen inline result object
        this.chosenResult = {
            resultId: chosenInlineResultData.result_id,
            query: chosenInlineResultData.query,
            inlineMessageId: chosenInlineResultData.inline_message_id,
            location: chosenInlineResultData.location ? {
                latitude: chosenInlineResultData.location.latitude,
                longitude: chosenInlineResultData.location.longitude
            } : undefined
        };
    }

    /**
     * Check if user is a member of a specific chat
     * @param chatId Chat ID to check membership in
     * @returns The member's status in the specified chat
     */
    async isChatMemberOf(chatId: number | string): Promise<ChatMember> {
        return this.bot.callApi("getChatMember", {
            chat_id: chatId,
            user_id: this.userId
        });
    }
}
