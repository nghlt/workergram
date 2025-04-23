// src/types/markup.ts
import type {
  InlineKeyboardButton as GrammyInlineKeyboardBtn,
  KeyboardButton as GrammyKeyboardBtn,
  InlineKeyboardMarkup as GrammyInlineKeyboardMk,
  ReplyKeyboardMarkup as GrammyReplyKeyboardMk,
  ReplyKeyboardRemove as GrammyReplyKeyboardRmv,
  ForceReply as GrammyForceRpl,
} from "@grammyjs/types";

// Runtime button builders
export class InlineKeyboardButton {
  text: string
  url?: string
  callback_data?: string

  constructor(opts: { text: string; url?: string; callbackData?: string }) {
    this.text = opts.text
    if (opts.url) this.url = opts.url
    if (opts.callbackData) this.callback_data = opts.callbackData
  }

  toJSON(): any {
    return {
      text: this.text,
      ...(this.url ? { url: this.url } : {}),
      ...(this.callback_data ? { callback_data: this.callback_data } : {}),
    }
  }
}

export class KeyboardButton {
  text: string
  request_contact?: boolean
  request_location?: boolean

  constructor(opts: { text: string; requestContact?: boolean; requestLocation?: boolean }) {
    this.text = opts.text
    if (opts.requestContact) this.request_contact = true
    if (opts.requestLocation) this.request_location = true
  }

  toJSON(): any {
    return {
      text: this.text,
      ...(this.request_contact ? { request_contact: this.request_contact } : {}),
      ...(this.request_location ? { request_location: this.request_location } : {}),
    }
  }
}

// Generic ReplyMarkup wrapper
export class ReplyMarkup {
  inline_keyboard?: GrammyInlineKeyboardBtn[][]
  keyboard?: GrammyKeyboardBtn[][]
  resize_keyboard?: boolean
  one_time_keyboard?: boolean
  selective?: boolean
  remove_keyboard?: true
  force_reply?: true

  constructor(opts: {
    inlineKeyboard?: InlineKeyboardButton[][]
    keyboard?: KeyboardButton[][]
    resizeKeyboard?: boolean
    oneTimeKeyboard?: boolean
    selective?: boolean
    removeKeyboard?: boolean
    forceReply?: boolean
  }) {
    if (opts.inlineKeyboard) {
      this.inline_keyboard = opts.inlineKeyboard.map(row => row.map(b => b.toJSON()))
    }
    if (opts.keyboard) {
      this.keyboard = opts.keyboard.map(row => row.map(b => b.toJSON()))
    }
    if (opts.resizeKeyboard) this.resize_keyboard = opts.resizeKeyboard
    if (opts.oneTimeKeyboard) this.one_time_keyboard = opts.oneTimeKeyboard
    if (opts.selective) this.selective = opts.selective
    if (opts.removeKeyboard) this.remove_keyboard = true
    if (opts.forceReply) this.force_reply = true
  }

  toJSON(): any {
    if (this.inline_keyboard) return { inline_keyboard: this.inline_keyboard }
    if (this.keyboard)
      return {
        keyboard: this.keyboard,
        resize_keyboard: this.resize_keyboard,
        one_time_keyboard: this.one_time_keyboard,
        selective: this.selective,
      }
    if (this.remove_keyboard) return { remove_keyboard: true, selective: this.selective }
    if (this.force_reply) return { force_reply: true, selective: this.selective }
    return {}
  }
}
