// src/utils/messageInstance.ts
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
    // deleting returns boolean, no need to wrap
    return this.bot.callApi<boolean>("deleteMessage", {
      chat_id: this.chatId,
      message_id: this.messageId,
    });
  }

  /** Reply to this message */
  async reply(text: string, options: Record<string, any> = {}): Promise<MessageInstance> {
    const sent = await this.bot.sendMessage(this.chatId, text, {
      reply_to_message_id: this.messageId,
      ...options,
    });
    // wrap raw Message in a MessageInstance
    return new MessageInstance(this.bot, sent);
  }

  /** Reply with a photo */
  async replyWithPhoto(photo: string, options: Record<string, any> = {}): Promise<MessageInstance> {
    const sent = await this.bot.sendPhoto(this.chatId, photo, options);
    return new MessageInstance(this.bot, sent);
  }

  /** Reply with a document */
  async replyWithDocument(document: string, options: Record<string, any> = {}): Promise<MessageInstance> {
    const sent = await this.bot.sendDocument(this.chatId, document, options);
    return new MessageInstance(this.bot, sent);
  }

  /** Forward this message to another chat */
  async forward(toChatId: number | string, options: Record<string, any> = {}): Promise<MessageInstance> {
    const sent = await this.bot.forwardMessage(toChatId, this.chatId, this.messageId, options);
    return new MessageInstance(this.bot, sent);
  }

  /** Copy this message to another chat. Returns the new message ID. */
  async copy(toChatId: number | string, options: Record<string, any> = {}): Promise<number> {
    const result = await this.bot.copyMessage(toChatId, this.chatId, this.messageId, options);
    return result.message_id;
  }
}
