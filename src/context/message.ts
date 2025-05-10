import { Message, Chat, ChatMember, ChatPermissions, Update as GrammyUpdate } from "@grammyjs/types";
import { BaseContextImpl } from "./base";
import { MessageContext } from "../types/context";
import { MessageInstance } from "../wrappers/messageInstance";
import { Bot } from "../bot";
import { 
  SendMessageOptions, 
  SendPhotoOptions, 
  SendVideoOptions, 
  SendStickerOptions, 
  SendAudioOptions, 
  SendDocumentOptions, 
  ForwardMessageOptions, 
  CopyMessageOptions, 
  CreateForumTopicOptions, 
  EditForumTopicOptions, 
  ChatInfo,
  MessageInfo, 
  ForumTopic,
  Update ,
  SenderInfo,  
  WorkergramVideo,
  WorkergramAudio,
  WorkergramDocument,
  WorkergramSticker, 
  WorkergramVideoNote,
  WorkergramAnimation,
  MediaInput
} from "../types";

/**
 * Context class for message updates
 */

export class MessageContextImpl extends BaseContextImpl implements MessageContext {
    // Frequently accessed properties at top level
    public readonly chatId: number | string;
    public readonly messageId: number;
    public readonly text: string;
    public readonly sender: SenderInfo;
    
    // Organized property groups
    public readonly chat: ChatInfo;
    public readonly message: MessageInfo;

    constructor(bot: Bot, update: Update) {
        super(bot, update);
        const message = update.message as Message;
        this.chatId = message.chat.id;
        this.messageId = message.message_id;
        this.text = message.text || message.caption || "";
        this.chat = {
            id: message.chat.id,
            topicId: message.message_thread_id,
            type: message.chat.type,
            title: message.chat.title,
            isForum: message.chat.is_forum || false,
        };
        this.sender = {
            id: message.from?.id,
            firstName: message.from?.first_name,
            lastName: message.from?.last_name,
            fullName: message.from?.first_name + " " + message.from?.last_name,
            username: message.from?.username,
        };

        const type = this.determineMessageType(message);
        const mediaProperties = this.extractMediaProperties(message);
        
        this.message = {
            id: message.message_id,
            text: message.text,
            command: message.text?.startsWith('/') ? message.text.split(' ')[0].slice(1) : undefined,
            commandPayload: message.text?.startsWith('/') ? message.text.split(' ').slice(1).join(' ') : undefined,
            date: message.date,
            isEdited: 'edit_date' in message,
            type,
            ...mediaProperties,
        };
    }

    private determineMessageType(message: Message): 'text' | 'photo' | 'video' | 'audio' | 'document' | 'sticker' | 'voice' | 'videoNote' | 'animation' {
        if (message.text) return 'text';
        if (message.photo) return 'photo';
        if (message.video) return 'video';
        if (message.audio) return 'audio';
        if (message.document) return 'document';
        if (message.sticker) return 'sticker';
        if (message.voice) return 'voice';
        if (message.video_note) return 'videoNote';
        if (message.animation) return 'animation';
        return 'text';
    }

    private extractMediaProperties(message: Message): Partial<MessageContextImpl['message']> {
        const properties: Partial<MessageContextImpl['message']> = {};
        
        if (message.photo) {
            properties.photo = message.photo.map(p => ({
                file_id: p.file_id,
                file_unique_id: p.file_unique_id,
                width: p.width,
                height: p.height,
                file_size: p.file_size
            }));
        }

        if (message.video) {
            const video: WorkergramVideo = {
                file_id: message.video.file_id,
                file_unique_id: message.video.file_unique_id,
                width: message.video.width,
                height: message.video.height,
                duration: message.video.duration,
                file_name: message.video.file_name,
                mime_type: message.video.mime_type,
                file_size: message.video.file_size
            };
            if (message.video.thumbnail) {
                video.thumbnail = {
                    file_id: message.video.thumbnail.file_id,
                    file_unique_id: message.video.thumbnail.file_unique_id,
                    width: message.video.thumbnail.width,
                    height: message.video.thumbnail.height,
                    file_size: message.video.thumbnail.file_size
                };
            }
            if (message.caption) {
                video.caption = {
                    text: message.caption,
                    entities: message.caption_entities
                };
            }
            properties.video = video;
        }

        if (message.audio) {
            const audio: WorkergramAudio = {
                file_id: message.audio.file_id,
                file_unique_id: message.audio.file_unique_id,
                duration: message.audio.duration,
                performer: message.audio.performer,
                title: message.audio.title,
                file_name: message.audio.file_name,
                mime_type: message.audio.mime_type,
                file_size: message.audio.file_size
            };
            if (message.audio.thumbnail) {
                audio.thumbnail = {
                    file_id: message.audio.thumbnail.file_id,
                    file_unique_id: message.audio.thumbnail.file_unique_id,
                    width: message.audio.thumbnail.width,
                    height: message.audio.thumbnail.height,
                    file_size: message.audio.thumbnail.file_size
                };
            }
            if (message.caption) {
                audio.caption = {
                    text: message.caption,
                    entities: message.caption_entities
                };
            }
            properties.audio = audio;
        }

        if (message.document) {
            const document: WorkergramDocument = {
                file_id: message.document.file_id,
                file_unique_id: message.document.file_unique_id,
                file_name: message.document.file_name,
                mime_type: message.document.mime_type,
                file_size: message.document.file_size
            };
            if (message.document.thumbnail) {
                document.thumbnail = {
                    file_id: message.document.thumbnail.file_id,
                    file_unique_id: message.document.thumbnail.file_unique_id,
                    width: message.document.thumbnail.width,
                    height: message.document.thumbnail.height,
                    file_size: message.document.thumbnail.file_size
                };
            }
            if (message.caption) {
                document.caption = {
                    text: message.caption,
                    entities: message.caption_entities
                };
            }
            properties.document = document;
        }

        if (message.sticker) {
            const sticker: WorkergramSticker = {
                file_id: message.sticker.file_id,
                file_unique_id: message.sticker.file_unique_id,
                width: message.sticker.width,
                height: message.sticker.height,
                is_animated: message.sticker.is_animated,
                is_video: message.sticker.is_video,
                emoji: message.sticker.emoji,
                set_name: message.sticker.set_name,
                file_size: message.sticker.file_size
            };
            if (message.sticker.thumbnail) {
                sticker.thumbnail = {
                    file_id: message.sticker.thumbnail.file_id,
                    file_unique_id: message.sticker.thumbnail.file_unique_id,
                    width: message.sticker.thumbnail.width,
                    height: message.sticker.thumbnail.height,
                    file_size: message.sticker.thumbnail.file_size
                };
            }
            properties.sticker = sticker;
        }

        if (message.voice) {
            properties.voice = {
                file_id: message.voice.file_id,
                file_unique_id: message.voice.file_unique_id,
                duration: message.voice.duration,
                mime_type: message.voice.mime_type,
                file_size: message.voice.file_size
            };
        }

        if (message.video_note) {
            const videoNote: WorkergramVideoNote = {
                file_id: message.video_note.file_id,
                file_unique_id: message.video_note.file_unique_id,
                length: message.video_note.length,
                duration: message.video_note.duration,
                file_size: message.video_note.file_size
            };
            if (message.video_note.thumbnail) {
                videoNote.thumbnail = {
                    file_id: message.video_note.thumbnail.file_id,
                    file_unique_id: message.video_note.thumbnail.file_unique_id,
                    width: message.video_note.thumbnail.width,
                    height: message.video_note.thumbnail.height,
                    file_size: message.video_note.thumbnail.file_size
                };
            }
            properties.videoNote = videoNote;
        }

        if (message.animation) {
            const animation: WorkergramAnimation = {
                file_id: message.animation.file_id,
                file_unique_id: message.animation.file_unique_id,
                width: message.animation.width,
                height: message.animation.height,
                duration: message.animation.duration,
                file_name: message.animation.file_name,
                mime_type: message.animation.mime_type,
                file_size: message.animation.file_size
            };
            if (message.animation.thumbnail) {
                animation.thumbnail = {
                    file_id: message.animation.thumbnail.file_id,
                    file_unique_id: message.animation.thumbnail.file_unique_id,
                    width: message.animation.thumbnail.width,
                    height: message.animation.thumbnail.height,
                    file_size: message.animation.thumbnail.file_size
                };
            }
            if (message.caption) {
                animation.caption = {
                    text: message.caption,
                    entities: message.caption_entities
                };
            }
            properties.animation = animation;
        }

        return properties;
    }

    /**
     * Reply to the current message
     * @param messageText Text of the reply
     * @param messageOptions Additional options for sending the message
     * @param asReply Whether to quote the original message (default: false)
     */
    async reply(messageText: string, messageOptions: SendMessageOptions = {}, asReply: boolean = false): Promise<MessageInstance> {
        const options: SendMessageOptions = { ...messageOptions };
        
        if (asReply) {
            options.reply_to_message_id = this.messageId;
        }

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
    async editText(messageText: string, messageOptions: SendMessageOptions = {}): Promise<MessageInstance | boolean> {
        const result = await this.bot.callApi<Message | boolean>("editMessageText", {
            chatId: this.chatId,
            messageId: this.messageId,
            text: messageText,
            ...messageOptions,
        });
        if (typeof result === "boolean") {
            return result;
        }
        return new MessageInstance(this.bot, result);
    }

    /**
     * Delete the current message
     */
    async deleteMessage(): Promise<boolean> {
        return this.bot.callApi<boolean>("deleteMessage", {
            chatId: this.chatId,
            messageId: this.messageId,
        });
    }

    /**
     * Send a photo in reply to the current message
     * @param photo Photo to send (file ID or URL)
     * @param options Additional options for sending the photo
     * @param asReply Whether to quote the original message (default: false)
     */
    async replyWithPhoto(photo: MediaInput, options: SendPhotoOptions = {}, asReply: boolean = false): Promise<MessageInstance> {
        const photoOptions: SendPhotoOptions = { ...options };
        
        if (asReply) {
            photoOptions.reply_to_message_id = this.messageId;
        }

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
    async replyWithDocument(document: MediaInput, options: SendDocumentOptions = {}, asReply: boolean = false): Promise<MessageInstance> {
        const docOptions: SendDocumentOptions = { ...options };
        
        if (asReply) {
            docOptions.reply_to_message_id = this.messageId;
        }

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
    async forwardMessage(toChatId: number | string, options: ForwardMessageOptions = {}): Promise<MessageInstance> {
        const forwardOptions = { ...options };
        return this.bot.forwardMessage(toChatId, this.chatId, this.messageId, forwardOptions);
    }

    /**
     * Copy the current message to another chat
     * @param toChatId Target chat ID to copy the message to
     * @param options Additional options for copying the message
     */
    async copyMessage(toChatId: number | string, options: CopyMessageOptions = {}): Promise<{ message_id: number; }> {
        const copyOptions: CopyMessageOptions = { ...options };
        const result = await this.bot.copyMessage(toChatId, this.chatId, this.messageId, copyOptions);
        return result;
    }

    /**
     * Get information about the chat
     */
    async getChat(): Promise<Chat> {
        return this.bot.callApi("getChat", {
            chatId: this.chatId,
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
            chatId: this.chatId,
            messageThreadId: messageThreadId
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
            chatId: this.chatId,
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
            chatId: this.chatId,
            messageThreadId: messageThreadId,
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
            chatId: this.chatId,
            messageThreadId: messageThreadId
        });
    }

    /**
     * Reopen a closed forum topic
     * @param messageThreadId Identifier of the forum topic
     * @returns True on success
     */
    async reopenForumTopic(messageThreadId: number): Promise<boolean> {
        return this.bot.callApi("reopenForumTopic", {
            chatId: this.chatId,
            messageThreadId: messageThreadId
        });
    }

    /**
     * Unpin all messages in a forum topic
     * @param messageThreadId Identifier of the forum topic
     * @returns True on success
     */
    async unpinAllForumTopicMessages(messageThreadId: number): Promise<boolean> {
        return this.bot.callApi("unpinAllForumTopicMessages", {
            chatId: this.chatId,
            messageThreadId: messageThreadId
        });
    }

    /**
     * Hide the 'General' topic in a forum supergroup chat
     * @returns True on success
     */
    async hideGeneralForumTopic(): Promise<boolean> {
        return this.bot.callApi("hideGeneralForumTopic", {
            chatId: this.chatId
        });
    }

    /**
     * Unhide the 'General' topic in a forum supergroup chat
     * @returns True on success
     */
    async unhideGeneralForumTopic(): Promise<boolean> {
        return this.bot.callApi("unhideGeneralForumTopic", {
            chatId: this.chatId
        });
    }

    /**
     * Get the file ID of the media in the message
     * @returns The file ID of the media, or undefined if no media is present
     */
    getMediaFileId(): string | undefined {
        const message = this.update.message;
        if (!message) return undefined;

        if (message.photo) return message.photo[message.photo.length - 1].file_id;
        if (message.video) return message.video.file_id;
        if (message.audio) return message.audio.file_id;
        if (message.document) return message.document.file_id;
        if (message.sticker) return message.sticker.file_id;
        if (message.voice) return message.voice.file_id;
        if (message.video_note) return message.video_note.file_id;
        if (message.animation) return message.animation.file_id;

        return undefined;
    }


    async replyWithVideo(video: MediaInput, options?: SendVideoOptions, asReply: boolean = true): Promise<MessageInstance> {
        const opts = { ...options };
        if (asReply) {
            opts.reply_to_message_id = this.messageId;
        }
        return this.bot.sendVideo(this.chatId, video, opts);
    }

    async replyWithSticker(sticker: MediaInput, options?: SendStickerOptions, asReply: boolean = true): Promise<MessageInstance> {
        const opts = { ...options };
        if (asReply) {
            opts.reply_to_message_id = this.messageId;
        }
        return this.bot.sendSticker(this.chatId, sticker, opts);
    }

    async replyWithAudio(audio: MediaInput, options?: SendAudioOptions, asReply: boolean = true): Promise<MessageInstance> {
        const opts = { ...options };
        if (asReply) {
            opts.reply_to_message_id = this.messageId;
        }
        return this.bot.sendAudio(this.chatId, audio, opts);
    }
}
