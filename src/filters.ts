import { Update } from "@grammyjs/types";
import { FilterFunction } from "./types";

/**
 * Filters for Telegram bot updates
 */
export const filters = {
  /**
   * Filter for exact text messages
   * @param text The text to match
   */
  text: (text: string): FilterFunction => {
    return (update: Update): boolean => {
      return (
        "message" in update &&
        update.message != null &&
        "text" in update.message &&
        update.message.text != null &&
        update.message.text === text
      );
    };
  },

  /**
   * Filter for text messages matching a regex
   * @param regex The regex to match
   */
  textMatches: (regex: RegExp): FilterFunction => {
    return (update: Update): boolean => {
      return (
        "message" in update &&
        update.message != null &&
        "text" in update.message &&
        update.message.text != null &&
        regex.test(update.message.text)
      );
    };
  },

  /**
   * Filter for commands
   * @param command The command to match (without /)
   */
  command: (command: string): FilterFunction => {
    return (update: Update): boolean => {
      if (
        !("message" in update) ||
        update.message == null ||
        !("text" in update.message) ||
        typeof update.message.text !== "string"
      ) {
        return false;
      }

      const text = update.message.text;
      const match = text.match(new RegExp(`^\\/${command}(?:@\\w+)?(?:\\s|$)`));
      return match != null;
    };
  },

  /**
   * Filter for callback query data
   * @param data The callback data to match
   */
  callbackData: (data: string): FilterFunction => {
    return (update: Update): boolean => {
      return (
        "callback_query" in update &&
        update.callback_query != null &&
        update.callback_query.data === data
      );
    };
  },

  /**
   * Filter for callback query data matching a regex
   * @param regex The regex to match
   */
  callbackDataMatches: (regex: RegExp): FilterFunction => {
    return (update: Update): boolean => {
      return (
        "callback_query" in update &&
        update.callback_query != null &&
        update.callback_query.data != null &&
        regex.test(update.callback_query.data)
      );
    };
  },

  /**
   * Filter for chat type
   * @param type The chat type to match: `private`, `group`, `supergroup`, `channel`
   */
  chatType: (
    type: "private" | "group" | "supergroup" | "channel",
  ): FilterFunction => {
    return (update: Update): boolean => {
      let chat;

      if ("message" in update && update.message) {
        chat = update.message.chat;
      } else if ("callback_query" in update && update.callback_query?.message) {
        chat = update.callback_query.message.chat;
      } else if ("chat_member" in update && update.chat_member) {
        chat = update.chat_member.chat;
      } else if ("my_chat_member" in update && update.my_chat_member) {
        chat = update.my_chat_member.chat;
      } else {
        return false;
      }

      return chat.type === type;
    };
  },

  /**
   * Filter for updates with new chat members
   */
  newChatMembers: (): FilterFunction => {
    return (update: Update): boolean => {
      return (
        "message" in update &&
        update.message != null &&
        "new_chat_members" in update.message &&
        Array.isArray(update.message.new_chat_members) &&
        update.message.new_chat_members.length > 0
      );
    };
  },

  /**
   * Filter for updates with a left chat member
   */
  leftChatMember: (): FilterFunction => {
    return (update: Update): boolean => {
      return (
        "message" in update &&
        update.message != null &&
        "left_chat_member" in update.message &&
        update.message.left_chat_member != null
      );
    };
  },

  /**
   * Filter for chat member status changes
   * @param statusChange The type of status change to filter for:  `join`, `leave`, `promote`, `demote`
   */
  memberStatusChange: (
    statusChange: "join" | "leave" | "promote" | "demote",
  ): FilterFunction => {
    return (update: Update): boolean => {
      // Check if this is a chat_member or my_chat_member update
      const isChatMemberUpdate =
        ("chat_member" in update && update.chat_member != null) ||
        ("my_chat_member" in update && update.my_chat_member != null);

      if (!isChatMemberUpdate) {
        return false;
      }

      const chatMember = update.chat_member || update.my_chat_member;
      if (!chatMember) return false;

      const oldStatus = chatMember.old_chat_member.status;
      const newStatus = chatMember.new_chat_member.status;

      switch (statusChange) {
        case "join":
          return (
            (oldStatus === "left" || oldStatus === "kicked") &&
            (newStatus === "member" ||
              newStatus === "administrator" ||
              newStatus === "restricted")
          );
        case "leave":
          return (
            (oldStatus === "member" ||
              oldStatus === "administrator" ||
              oldStatus === "restricted") &&
            (newStatus === "left" || newStatus === "kicked")
          );
        case "promote":
          return (
            (oldStatus === "member" || oldStatus === "restricted") &&
            newStatus === "administrator"
          );
        case "demote":
          return (
            oldStatus === "administrator" &&
            (newStatus === "member" || newStatus === "restricted")
          );
        default:
          return false;
      }
    };
  },

  /**
   * Create a custom filter
   * @param filterFn The filter function
   */
  custom: (filterFn: (update: Update) => boolean): FilterFunction => {
    return filterFn;
  },

  /**
   * Combine multiple filters with AND logic
   * @param filters The filters to combine
   */
  and: (filters: FilterFunction[]): FilterFunction => {
    return (update: Update): boolean => {
      return filters.every((filter) => filter(update));
    };
  },

  

  /**
   * Combine multiple filters with OR logic
   * @param filters The filters to combine
   */
  or: (filters: FilterFunction[]): FilterFunction => {
    return (update: Update): boolean => {
      return filters.some((filter) => filter(update));
    };
  },

  /**
   * Negate a filter
   * @param filter The filter to negate
   */
  not: (filter: FilterFunction): FilterFunction => {
    return (update: Update): boolean => {
      return !filter(update);
    };
  },

  /**
   * Filter for specific chat ID
   * @param chatId The chat ID to match
   */
  chatId: (chatId: number): FilterFunction => {
    return (update: Update): boolean => {
      let chat;

      if ("message" in update && update.message) {
        chat = update.message.chat;
      } else if ("callback_query" in update && update.callback_query?.message) {
        chat = update.callback_query.message.chat;
      } else if ("chat_member" in update && update.chat_member) {
        chat = update.chat_member.chat;
      } else if ("my_chat_member" in update && update.my_chat_member) {
        chat = update.my_chat_member.chat;
      } else {
        return false;
      }

      return chat.id === chatId;
    };
  },

  /**
   * Filter for specific user ID
   * @param userId The user ID to match
   */
  userId: (userId: number): FilterFunction => {
    return (update: Update): boolean => {
      let user;

      if ("message" in update && update.message) {
        user = update.message.from;
      } else if ("callback_query" in update && update.callback_query) {
        user = update.callback_query.from;
      } else if ("chat_member" in update && update.chat_member) {
        user = update.chat_member.from;
      } else if ("my_chat_member" in update && update.my_chat_member) {
        user = update.my_chat_member.from;
      } else {
        return false;
      }

      return user?.id === userId;
    };
  },
};
