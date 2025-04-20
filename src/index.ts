/**
 * WorkerGram - A TypeScript library for building Telegram bots on Cloudflare Workers
 * src/index.ts
 */
 

// Export core modules
export { Bot } from './bot';
export { escapeMarkdown, escapeHTML } from './utils';

// Export context classes
export {
  BaseContextImpl as BaseContext,
  MessageContextImpl as MessageContext,
  CallbackQueryContextImpl as CallbackQueryContext,
  ChatMemberUpdateContextImpl as ChatMemberUpdateContext,
} from './context';

// Export types
export type {
  BotInterface,
  EventFilter,
  FilterFunction,
  MessageHandler,
  CallbackQueryHandler,
  ChatMemberUpdateHandler,
  GenericHandler,
  ApiResponse,
  SendMessageOptions,
  CopyMessageOptions,
  SendPhotoOptions,
  SendDocumentOptions,
  AnswerCallbackQueryOptions,
  SetWebhookOptions
} from './types';

// Re-export types from grammyjs/types for convenience
export type {
  Update,
  User,
  Chat,
  Message,
  CallbackQuery,
  ChatMemberUpdated,
  ChatPermissions,
  WebhookInfo,
  ChatMember,
  ChatMemberOwner,
  ChatMemberAdministrator,
  ChatMemberMember,
  ChatMemberRestricted,
  ChatMemberLeft, 
  ChatMemberBanned 
} from './types';

export {filters} from './filters'