import { InlineQuery, Update, ChatMember, InlineQueryResultArticle, InlineQueryResultPhoto, InlineQueryResultDocument, InlineQueryResultVideo, InlineQueryResultLocation } from "@grammyjs/types";
import { AnswerInlineQueryOptions } from "../types/options";
import { InlineQueryContext, UserInfo, InlineQueryInfo } from "../types/context";
import { BotInterface, InlineQueryResult } from "../types";
import { BaseContextImpl } from "./base";

// Helper type for result builders
type ResultBuilder<T extends InlineQueryResult> = Partial<T> & { id: string, title: string };


/**
 * Context class for inline query updates
 */

export class InlineQueryContextImpl extends BaseContextImpl implements InlineQueryContext {
    // Frequently accessed properties at top level
    userId: number;
    query: string;
    
    // Organized property groups
    user: UserInfo;
    inlineQuery: InlineQueryInfo;

    constructor(bot: BotInterface, update: Update) {
        super(bot, update);
        const inlineQueryData = update.inline_query!;
        
        // Set top-level properties
        this.query = inlineQueryData.query;
        this.userId = inlineQueryData.from.id;
        
        // Create user object
        const from = inlineQueryData.from;
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
        
        // Create inline query object
        this.inlineQuery = {
            id: inlineQueryData.id,
            query: inlineQueryData.query,
            offset: inlineQueryData.offset,
            chatType: inlineQueryData.chat_type
        };
    }

    /**
     * Answer inline query with results
     * @param results Array of InlineQueryResult to answer with
     * @param options Additional options for answering the inline query
     */
    async answer(results: ReadonlyArray<InlineQueryResult>, options: AnswerInlineQueryOptions = {}): Promise<boolean> {
        return this.bot.callApi("answerInlineQuery", {
            inline_query_id: this.inlineQuery.id,
            results: JSON.stringify(results),
            ...options,
        });
    }

    /**
     * Alias for answer() method
     * @param results Array of InlineQueryResult to answer with
     * @param options Additional options for answering the inline query
     */
    async answerWithResults(results: ReadonlyArray<InlineQueryResult>, options: AnswerInlineQueryOptions = {}): Promise<boolean> {
        return this.answer(results, options);
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
    
    /**
     * Create an article result
     * @param id Unique identifier for this result
     * @param title Title of the result
     * @param description Optional. Short description of the result
     * @param text Message text that will be sent when user selects this result
     * @param options Optional. Additional options
     */
    createArticleResult(id: string, title: string, description: string, text: string, options: Partial<InlineQueryResultArticle> = {}): InlineQueryResultArticle {
        return {
            type: "article",
            id,
            title,
            description,
            input_message_content: { message_text: text },
            ...options
        };
    }

    /**
     * Create a photo result
     * @param id Unique identifier for this result
     * @param photoUrl URL of the photo
     * @param thumbnailUrl URL of the thumbnail
     * @param title Optional. Title of the result
     * @param options Optional. Additional options
     */
    createPhotoResult(id: string, photoUrl: string, thumbnailUrl: string, title?: string, options: Partial<InlineQueryResultPhoto> = {}): InlineQueryResultPhoto {
        return {
            type: "photo",
            id,
            photo_url: photoUrl,
            thumbnail_url: thumbnailUrl,
            title,
            ...options
        };
    }
    
    /**
     * Create a document result
     * @param id Unique identifier for this result
     * @param title Title of the result
     * @param documentUrl URL of the document
     * @param thumbnailUrl URL of the thumbnail
     * @param options Optional. Additional options
     */
    createDocumentResult(id: string, title: string, documentUrl: string, thumbnailUrl: string, options: Partial<InlineQueryResultDocument> = {}): InlineQueryResultDocument {
        return {
            type: "document",
            id,
            title,
            document_url: documentUrl,
            thumbnail_url: thumbnailUrl,
            mime_type: options.mime_type || "application/pdf",
            ...options
        };
    }
    
    /**
     * Create a video result
     * @param id Unique identifier for this result
     * @param title Title of the result
     * @param videoUrl URL of the video
     * @param thumbnailUrl URL of the thumbnail
     * @param options Optional. Additional options
     */
    createVideoResult(id: string, title: string, videoUrl: string, thumbnailUrl: string, options: Partial<InlineQueryResultVideo> = {}): InlineQueryResultVideo {
        return {
            type: "video",
            id,
            title,
            video_url: videoUrl,
            thumbnail_url: thumbnailUrl,
            mime_type: options.mime_type || "video/mp4",
            ...options
        };
    }
    
    /**
     * Create a location result
     * @param id Unique identifier for this result
     * @param title Title of the result
     * @param latitude Latitude of the location
     * @param longitude Longitude of the location
     * @param options Optional. Additional options
     */
    createLocationResult(id: string, title: string, latitude: number, longitude: number, options: Partial<InlineQueryResultLocation> = {}): InlineQueryResultLocation {
        return {
            type: "location",
            id,
            title,
            latitude,
            longitude,
            ...options
        };
    }
    
    /**
     * Generate a random ID for inline query results
     * @returns A random string ID
     */
    generateResultId(): string {
        return Math.random().toString(36).substring(2, 15);
    }

    /**
     * Reply to the current update (not implemented for inline queries)
     * @param messageText Text of the reply
     * @param messageOptions Additional options for sending the message
     */
    async reply(): Promise<any> {
        throw new Error("Cannot reply to an inline query directly. Use answer() method instead.");
    }
}
