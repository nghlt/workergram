// src/wrappers/messageInstance.ts
import type { Message } from "@grammyjs/types";
import type { BotInterface } from "../types/bot";

export class MessageInstance {
  constructor(private bot: BotInterface, private msg: Message) {}

  /** Raw Telegram message object */
  get raw(): Message {
    return this.msg;
  }

  /** Chat identifier */
  get chatId(): number | string {
    return this.msg.chat.id;
  }

  /** Message identifier */
  get messageId(): number {
    return this.msg.message_id;
  }

  /** Edit this message's text */
  async editText(text: string, options: Record<string, any> = {}): Promise<MessageInstance | boolean> {
    const result = await this.bot.callApi<Message | boolean>("editMessageText", {
      chat_id: this.chatId,
      message_id: this.messageId,
      text,
      ...options,
    });
    if (typeof result === "boolean") {
      return result;
    }
    return new MessageInstance(this.bot, result);
  }

  /** Delete this message */
  async delete(): Promise<boolean> {
    return this.bot.callApi<boolean>("deleteMessage", {
      chat_id: this.chatId,
      message_id: this.messageId,
    });
  }

  /** Reply to this message */
  async reply(text: string, options: Record<string, any> = {}): Promise<MessageInstance> {
    const result = await this.bot.callApi<Message>("sendMessage", {
      chat_id: this.chatId,
      text,
      reply_to_message_id: this.messageId,
      ...options,
    });
    return new MessageInstance(this.bot, result);
  }

  /** Reply with a photo */
  async replyWithPhoto(photo: string, options: Record<string, any> = {}): Promise<MessageInstance> {
    const result = await this.bot.callApi<Message>("sendPhoto", {
      chat_id: this.chatId,
      photo,
      ...options,
    });
    return new MessageInstance(this.bot, result);
  }

  /** Reply with a document */
  async replyWithDocument(document: string, options: Record<string, any> = {}): Promise<MessageInstance> {
    const result = await this.bot.callApi<Message>("sendDocument", {
      chat_id: this.chatId,
      document,
      ...options,
    });
    return new MessageInstance(this.bot, result);
  }

  /** Forward this message to another chat */
  async forward(toChatId: number | string, options: Record<string, any> = {}): Promise<MessageInstance> {
    const result = await this.bot.callApi<Message>("forwardMessage", {
      chat_id: toChatId,
      from_chat_id: this.chatId,
      message_id: this.messageId,
      ...options,
    });
    return new MessageInstance(this.bot, result);
  }

  /** Copy this message to another chat. Returns the new message ID. */
  async copy(toChatId: number | string, options: Record<string, any> = {}): Promise<number> {
    const result = await this.bot.callApi<{ message_id: number }>("copyMessage", {
      chat_id: toChatId,
      from_chat_id: this.chatId,
      message_id: this.messageId,
      ...options,
    });
    return result.message_id;
  }
}
