// Example demonstrating chat member update handlers in WorkerGram
import { Bot, ChatMemberUpdateContext, filters } from '../dist';

// Handler for a Cloudflare Worker
export default {
  async fetch(request, env, ctx) {
    // Get the secret token from env variables
    const BOT_TOKEN = env.BOT_TOKEN;
    
    // Create the bot instance
    const bot = new Bot(BOT_TOKEN);
    
    // Configure event handlers
    setupEventHandlers(bot);
    
    // Set up webhook path
    const url = new URL(request.url);
    if (url.pathname === '/webhook') {
      try {
        // Parse the update from the request
        const update = await request.json();
        
        // Process the update
        await bot.processUpdate(update);
        
        // Return a success response
        return new Response('OK', { status: 200 });
      } catch (error) {
        // Return an error response
        return new Response('Error: ' + error.message, { status: 500 });
      }
    }
    
    // Return a default response for other paths
    return new Response('Welcome to the WorkerGram bot webhook!');
  }
};

/**
 * Configure event handlers for the bot
 * @param {Bot} bot The bot instance
 */
function setupEventHandlers(bot) {
  // Handle new members joining a group
  bot.on('chat_member', (ctx) => {
    if (ctx.isJoining()) {
      return ctx.reply(`Welcome to the group, ${ctx.user.first_name}!`);
    }
  });
  
  // Handle members leaving a group
  bot.on('chat_member', (ctx: ChatMemberUpdateContext) => {
    if (ctx.isLeaving()) {
      return ctx.reply(`Goodbye, ${ctx.user.first_name}!`);
    }
  });
  
  // Handle member promotions (becoming an admin)
  bot.on('chat_member', (ctx) => {
    if (ctx.isPromoted()) {
      return ctx.reply(`Congratulations ${ctx.user.first_name}! You're now an admin.`);
    }
  });
  
  // Handle member demotions (losing admin status)
  bot.on('chat_member', (ctx) => {
    if (ctx.isDemoted()) {
      return ctx.reply(`${ctx.user.first_name} is no longer an admin.`);
    }
  });
  
  // Using filters to handle specific chat member updates
  bot.on('chat_member', (ctx) => {
    return ctx.reply('A new member has joined our channel!');
  }, filters.chatType('channel'));
  
  // Combined filters for specific scenarios
  bot.on('chat_member', (ctx) => {
    return ctx.reply('A new member has joined our supergroup!');
  }, filters.and([
    filters.chatType('supergroup'),
    (update) => update.chat_member?.new_chat_member?.status === 'member'
  ]));
}