/**
 * src/filters.ts
 * Defines filter functions for matching and filtering Telegram update events in Workergram.
 */

import { ChatMemberRestricted, Update } from "@grammyjs/types";
import { FilterFunction } from "./types/eventHandlers";
import { UpdateType } from "./types/bot";

function withEvents(fn: FilterFunction, events: UpdateType[]): FilterFunction {
  const filtered = fn as FilterFunction;
  filtered.compatibleEvents = events;
  return filtered;
}

/**
 * Filters for Telegram bot updates
 */
export const filters = {
  /**
   * Filter for exact text messages
   * @param text The text to match
   */
  text: (text: string): FilterFunction =>
    withEvents(
      (update) => {
        return "message" in update && update.message?.text === text;
      },
      ["message"]
    ),

  /**
   * Filter for text messages matching a regex
   * @param regex The regex to match
   */
  textMatches: (regex: RegExp): FilterFunction => withEvents((update) => "message" in update && typeof update.message?.text === "string" && regex.test(update.message.text), ["message"]),

  /**
   * Filter for commands
   * @param command The command to match (without /)
   */
  command: (command: string): FilterFunction =>
    withEvents(
      (update) => {
        if (!("message" in update) || typeof update.message?.text !== "string") return false;
        return new RegExp(`^\\/${command}(?:@\\w+)?(?:\\s|$)`).test(update.message.text);
      },
      ["message"]
    ),

  /**
   * Filter for callback query data
   * @param data The callback data to match
   */
  callbackData: (data: string): FilterFunction => withEvents((update) => "callback_query" in update && update.callback_query?.data === data, ["callback_query"]),

  /**
   * Filter for callback query data matching a regex
   * @param regex The regex to match
   */
  callbackDataMatches: (regex: RegExp): FilterFunction =>
    withEvents((update) => "callback_query" in update && typeof update.callback_query?.data === "string" && regex.test(update.callback_query.data), ["callback_query"]),

  /**
   * Filter for chat type
   * @param type The chat type to match: `private`, `group`, `supergroup`, `channel`
   */
  chatType: (type: "private" | "group" | "supergroup" | "channel"): FilterFunction =>
    withEvents(
      (update) => {
        let chat;
        if ("message" in update && update.message) chat = update.message.chat;
        else if ("callback_query" in update && update.callback_query?.message) chat = update.callback_query.message.chat;
        else if ("chat_member" in update && update.chat_member) chat = update.chat_member.chat;
        else if ("my_chat_member" in update && update.my_chat_member) chat = update.my_chat_member.chat;
        else return false;
        return chat.type === type;
      },
      ["message", "callback_query", "chat_member"]
    ),

  /**
   * Filter for updates with new chat members
   */
  newChatMembers: (): FilterFunction =>
    withEvents(
      (update) => {
        const oldStatus = update.chat_member?.old_chat_member.status,
          newStatus = update.chat_member?.new_chat_member.status;
        if (oldStatus === "restricted") {
          const oldMember = update.chat_member?.old_chat_member as ChatMemberRestricted;
          return !oldMember.is_member;
        }
        return (oldStatus === "left" || oldStatus === "kicked") && (newStatus === "member" || newStatus === "administrator" || newStatus === "restricted");
      },
      ["chat_member"]
    ),

  /**
   * Filter for updates with a left chat member
   */
  leftChatMember: (): FilterFunction =>
    withEvents(
      (update) => {
        const oldStatus = update.chat_member?.old_chat_member.status,
          newStatus = update.chat_member?.new_chat_member.status;
        return (oldStatus === "member" || oldStatus === "administrator" || oldStatus === "restricted") && newStatus === "left";
      },
      ["chat_member"]
    ),

  /**
   * Filter for updates with a kicked chat member
   */
  kickedChatMember: (): FilterFunction =>
    withEvents(
      (update) => {
        const oldStatus = update.chat_member?.old_chat_member.status,
          newStatus = update.chat_member?.new_chat_member.status;
        return (oldStatus === "member" || oldStatus === "administrator" || oldStatus === "restricted") && newStatus === "kicked";
      },
      ["chat_member"]
    ),

  /**
   * Create a custom filter
   * @param filterFn The filter function
   * @param events Specific update types for this filter
   */
  customWithEvents: (filterFn: (update: Update) => boolean, events: UpdateType[]): FilterFunction => withEvents(filterFn, events),

  /**
   * Combine multiple filters with AND logic
   * @param filters The filters to combine
   */
  and: (filters: FilterFunction[]): FilterFunction => {
    const result = (update: Update) => filters.every((f) => f(update));
    const compatible = filters.flatMap((f) => f.compatibleEvents || []);
    return withEvents(result, Array.from(new Set(compatible)));
  },

  /**
   * Combine multiple filters with OR logic
   * @param filters The filters to combine
   */
  or: (filters: FilterFunction[]): FilterFunction => {
    const result = (update: Update) => filters.some((f) => f(update));
    const compatible = filters.flatMap((f) => f.compatibleEvents || []);
    return withEvents(result, Array.from(new Set(compatible)));
  },

  /**
   * Negate a filter
   * @param filter The filter to negate
   */
  not: (filter: FilterFunction): FilterFunction => {
    const result = (update: Update) => !filter(update);
    return withEvents(result, filter.compatibleEvents || []);
  },

  /**
   * Filter for specific chat ID
   * @param chatId The chat ID to match
   */
  chatId: (chatId: number | number[]): FilterFunction =>
    withEvents(
      (update) => {
        let chat;
        if ("message" in update && update.message) chat = update.message.chat;
        else if ("callback_query" in update && update.callback_query?.message) chat = update.callback_query.message.chat;
        else if ("chat_member" in update && update.chat_member) chat = update.chat_member.chat;
        else if ("my_chat_member" in update && update.my_chat_member) chat = update.my_chat_member.chat;
        else return false;
        return (Array.isArray(chatId) ? chatId : [chatId]).includes(chat.id);
      },
      ["message", "callback_query", "chat_member"]
    ),

  /**
   * Filter for specific user ID
   * @param userId The user ID to match
   */
  userId: (userId: number | number[]): FilterFunction =>
    withEvents(
      (update) => {
        let user;
        if ("message" in update && update.message) user = update.message.from;
        else if ("callback_query" in update && update.callback_query) user = update.callback_query.from;
        else if ("chat_member" in update && update.chat_member) user = update.chat_member.from;
        else if ("my_chat_member" in update && update.my_chat_member) user = update.my_chat_member.from;
        else return false;
        return (Array.isArray(userId) ? userId : [userId]).includes(user?.id || 0);
      },
      ["message", "chat_member"]
    ),
};
