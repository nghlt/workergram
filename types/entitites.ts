import { User } from "@grammyjs/types";


/**
 * MessageEntity type for representing special entities in messages
 */

export interface MessageEntity {
  type: "mention" |
  "hashtag" |
  "cashtag" |
  "bot_command" |
  "url" |
  "email" |
  "phone_number" |
  "bold" |
  "italic" |
  "underline" |
  "strikethrough" |
  "spoiler" |
  "code" |
  "pre" |
  "text_link" |
  "text_mention" |
  "custom_emoji";
  offset: number;
  length: number;
  url?: string; // For "text_link" only
  user?: User; // For "text_mention" only
  language?: string; // For "pre" only
  custom_emoji_id?: string; // For "custom_emoji" only
}
/**
 * Reply markup interface for various keyboard types
 */

export interface ReplyMarkup {
  inline_keyboard?: Array<
    Array<{
      text: string;
      url?: string;
      callback_data?: string;
      web_app?: { url: string; };
      login_url?: {
        url: string;
        forward_text?: string;
        bot_username?: string;
        request_write_access?: boolean;
      };
      switch_inline_query?: string;
      switch_inline_query_current_chat?: string;
      callback_game?: {};
      pay?: boolean;
    }>
  >;
  keyboard?: Array<
    Array<{
      text: string;
      request_contact?: boolean;
      request_location?: boolean;
      request_poll?: { type?: "quiz" | "regular"; };
      web_app?: { url: string; };
    }>
  >;
  remove_keyboard?: boolean;
  force_reply?: boolean;
  input_field_placeholder?: string;
  selective?: boolean;
  one_time_keyboard?: boolean;
  resize_keyboard?: boolean;
  is_persistent?: boolean;
}

