// Comprehensive examples showcasing the filter system in WorkerGram
import { Bot, filters } from '../dist';

// Create a new Bot instance (token would be provided in production)
const bot = new Bot('YOUR_BOT_TOKEN');

// Basic command filter examples
bot.on('message', (ctx) => {
  return ctx.reply('Hello! I am a bot built with WorkerGram.');
}, filters.command('start'));

bot.on('message', (ctx) => {
  return ctx.reply('Here are my available commands: /start, /help, /info');
}, filters.command('help'));

// Text matching filters
bot.on('message', (ctx) => {
  return ctx.reply('Yes, I am a bot!');
}, filters.text('Are you a bot?'));

bot.on('message', (ctx) => {
  return ctx.reply('I like you too!');
}, filters.textMatches(/^I like (you|this bot)/i));

// Chat type filters
bot.on('message', (ctx) => {
  return ctx.reply('This is a private conversation between you and me.');
}, filters.chatType('private'));

bot.on('message', (ctx) => {
  return ctx.reply('Hello everyone in this group!');
}, filters.chatType('group'));

bot.on('message', (ctx) => {
  return ctx.reply('Hello everyone in this supergroup!');
}, filters.chatType('supergroup'));

// Callback query data filters
bot.on('callback_query', (ctx) => {
  return ctx.answer('You clicked the "yes" button!');
}, filters.callbackData('answer_yes'));

bot.on('callback_query', (ctx) => {
  return ctx.answer('You clicked a button with a number!');
}, filters.callbackDataMatches(/^number_\d+$/));

// Chat member status filters
bot.on('chat_member', (ctx) => {
  return ctx.reply('Welcome to the chat!');
}, filters.memberStatusChange('join'));

bot.on('chat_member', (ctx) => {
  return ctx.reply('Goodbye!');
}, filters.memberStatusChange('leave'));

// Combining filters with AND logic
bot.on('message', (ctx) => {
  return ctx.reply('Hello admin in private chat!');
}, filters.and([
  filters.chatType('private'),
  filters.custom(update => {
    // Custom logic to check if user is admin (example)
    return update.message?.from?.id === 123456789; // admin's ID
  })
]));

// Combining filters with OR logic
bot.on('message', (ctx) => {
  return ctx.reply('I respond to both "hello" and "hi"');
}, filters.or([
  filters.text('hello'),
  filters.text('hi')
]));

// Negating filters
bot.on('message', (ctx) => {
  return ctx.reply('This is not a private chat');
}, filters.not(filters.chatType('private')));

// Chat and user ID filters
bot.on('message', (ctx) => {
  return ctx.reply('Hello to this specific chat!');
}, filters.chatId(-100123456789)); // Group chat ID

bot.on('message', (ctx) => {
  return ctx.reply('Hello specific user!');
}, filters.userId(123456789)); // User ID

// Custom filters
bot.on('message', (ctx) => {
  return ctx.reply('You sent a long message!');
}, filters.custom(update => {
  // Check if message is longer than 100 characters
  return (update.message?.text?.length || 0) > 100;
}));

// Combining different filter types
bot.on('message', (ctx) => {
  return ctx.reply('You sent a photo in a group chat!');
}, filters.and([
  filters.chatType('group', 'supergroup'),
  filters.custom(update => !!update.message?.photo)
]));

// Object-based filtering
bot.on('message', (ctx) => {
  return ctx.reply('You sent a message with location!');
}, { 'message.location': { $exists: true } });

// Example of handling an update
async function handleUpdate(update) {
  // Process the update with all the above filters
  await bot.processUpdate(update);
}

// Export the bot for use in a Cloudflare Worker
export { bot, handleUpdate };