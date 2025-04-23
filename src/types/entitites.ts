/**
 * src/types/entities.ts
 * Defines the MessageEntity interface representing special entities in Telegram messages,
 * such as mentions, hashtags, commands, formatting, and custom emojis.
 */
import { MessageEntity } from "@grammyjs/types";

/**
 * Represents a special entity in a message, including its type, offset, length,
 * and any related metadata like URLs, user mentions, or language.
 */
export type MessageEntities = MessageEntity[];
