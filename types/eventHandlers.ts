import { Update } from "@grammyjs/types";
import { UpdateType } from "./bot";
import { MessageContext, EditedMessageContext, CallbackQueryContext, ChatMemberUpdateContext } from "./context";


// Event handlers
export type GenericHandler<T> = (ctx: T) => Promise<void> | void;
export type MessageHandler = GenericHandler<MessageContext>;
export type EditedMessageHandler = GenericHandler<EditedMessageContext>;
export type CallbackQueryHandler = GenericHandler<CallbackQueryContext>;
export type ChatMemberUpdateHandler = GenericHandler<ChatMemberUpdateContext>;
// Event filter types
export type FilterFunction = ((update: Update) => boolean) & { compatibleEvents?: UpdateType[]; };
export type FilterObject = Record<string, any>;
export type EventFilter = FilterFunction | FilterObject;
