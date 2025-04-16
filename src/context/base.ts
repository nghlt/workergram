import { Update, Message } from "@grammyjs/types";
import { SendMessageOptions } from "../types/options";
import { BaseContext } from "../types/context";
import { BotInterface } from "../types/bot";


/**
 * Base context class for all update types
 */

export class BaseContextImpl implements BaseContext {
    bot: BotInterface;
    update: Update;

    constructor(bot: BotInterface, update: Update) {
        this.bot = bot;
        this.update = update;
    }

    /**
     * Reply to the current update
     * @param messageText Text of the reply
     * @param messageOptions Additional options for sending the message
     */
    async reply(messageText: string, messageOptions: SendMessageOptions = {}): Promise<Message> {
        throw new Error("Method not implemented in base context");
    }
}
