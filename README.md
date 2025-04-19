# WorkerGram

A TypeScript library for building Telegram bots on Cloudflare Workers, providing a modern, type-safe, and developer-friendly framework for serverless bot development.

## Features

- **TypeScript-first design** with comprehensive type definitions
- **Serverless webhook-based architecture** optimized for Cloudflare Workers
- **Advanced context management** and update handling
- **Specialized context for chat member updates** (joins, leaves)
- **Comprehensive filter system** for precise handler targeting

## Installation

```bash
npm install workergram
```

## Basic Usage

Here is a complete example of implementing a Telegram bot in a Cloudflare Worker using WorkerGram:

```typescript
import { Bot, filters } from 'workergram';

// Your bot token should be stored in a Cloudflare Workers secret
export default {
  async fetch(request, env, ctx) {
    // Create a new bot instance using the environment variable
    const bot = new Bot(env.TELEGRAM_BOT_TOKEN);
    
    // Register command handlers
    bot.addHandler('message', async (ctx) => {
      await ctx.reply('Hello! I am a Telegram bot powered by WorkerGram.');
    }, filters.command('start'));
    
    bot.addHandler('message', async (ctx) => {
      await ctx.reply('This is a help message. You can use the following commands:\n' +
        '/start - Start the bot\n' +
        '/help - Show this help message');
    }, filters.command('help'));
    
    // Handle regular text messages
    bot.addHandler('message', async (ctx) => {
      if (ctx.messageText) {
        await ctx.reply(`You said: ${ctx.messageText}`);
      }
    }, filters.custom(update => 
      'message' in update && 
      update.message?.text && 
      !update.message.text.startsWith('/')
    ));
    
    // Handle new members joining
    bot.on('chat_member', async (ctx) => {
      if (ctx.isJoining()) {
        await ctx.reply(`Welcome to the group, ${ctx.firstName}!`);
      }
    }, filters.memberStatusChange('join'));
    
    // If this is a POST request from Telegram, process it as an update
    if (request.method === 'POST') {
      try {
        // Parse the request body as JSON
        const update = await request.json();
        
        // Process the update
        await bot.onUpdate(update);
        
        // Return a 200 OK response to Telegram
        return new Response('OK', { status: 200 });
      } catch (error) {
        // Handle any errors
        console.error('Error processing update:', error);
        return new Response('Error processing update', { status: 500 });
      }
    }
    
    // For all other requests, return a simple response
    return new Response('WorkerGram Bot is running!', { status: 200 });
  }
};
```

## Bot Workflow

The typical workflow of a bot follows these steps:

1. **Create a Bot Instance**
   ```typescript
   const bot = new Bot(env.BOT_TOKEN);
   ```

2. **Declare Handlers for Events**
   ```typescript
   bot.on('message', (ctx) => {
     ctx.reply('Hello!');
   });
   
   bot.on('callback_query', (ctx) => {
     ctx.answer('Button clicked!');
   });
   ```

3. **Provide and Process the Update**
   ```typescript
   // Get update from Telegram webhook
   const update = await request.json();
   
   // Process the update
   await bot.processUpdate(update);
   ```

### Two Ways to Create a Bot and Process Updates

#### Option 1: Providing Update During Creation
```typescript
// Creating bot with update in constructor
const bot = new Bot(token, update);
```
- The update is processed immediately during construction
- Useful for single-request serverless handling
- All handlers must be defined before the bot is created

#### Option 2: Creating Bot and Processing Update Separately
```typescript
// Creating bot without update
const bot = new Bot(token);

// Set up handlers
bot.on('message', msgHandler);
bot.on('callback_query', cbQueryHandler);

// Process update later
await bot.processUpdate(update);
```
- Initialize, then set up handlers, then process
- More flexible approach
- Typical for webhook-based applications

## Filter System

WorkerGram includes a powerful filtering system to help you handle exactly the updates you want. Here's a comprehensive guide to the available filters:

### Basic Filters

| Filter | Description | Example |
|--------|-------------|---------|
| `text` | Match exact message text | `filters.text('hello')` |
| `textMatches` | Match message text with regex | `filters.textMatches(/^hi/i)` |
| `callbackData` | Match exact callback query data | `filters.callbackData('btn_1')` |
| `callbackDataMatches` | Match callback data with regex | `filters.callbackDataMatches(/^btn_/)` |
| `command` | Match bot commands | `filters.command('start')` |
| `chatType` | Match specific chat types: `private`, `group`, `supergroup`, `channel` | `filters.chatType('private')` |
| `chatId` | Match specific chat ID | `filters.chatId(123456789)` |
| `userId` | Match specific user ID | `filters.userId(123456789)` |
| `newChatMembers` | Match new chat member updates | `filters.newChatMembers()` |
| `leftChatMember` | Match left chat member updates | `filters.leftChatMember()` |
| `memberStatusChange` | Match specific member status changes: `join`, `leave`, `promote`, `demote` | `filters.memberStatusChange('join')` |

### Logical Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `and` | Combine filters with AND logic | `filters.and([filters.chatType('private'), filters.textMatches(/hello/i)])` |
| `or` | Combine filters with OR logic | `filters.or([filters.command('start'), filters.command('help')])` |
| `not` | Invert a filter | `filters.not(filters.textMatches(/hello/i))` |

### Custom Filters

You can create custom filters for complex matching requirements:

```typescript
// Match messages containing photos
bot.on('message', ctx => {
  ctx.reply('Nice photo!');
}, filters.custom(update => {
  return 'message' in update && 
         update.message && 
         'photo' in update.message && 
         Array.isArray(update.message.photo) && 
         update.message.photo.length > 0;
}));

// Match messages from a specific user
bot.on('message', ctx => {
  ctx.reply('Message from admin');
}, filters.custom(update => {
  if ('message' in update && update.message?.from) {
    return update.message.from.id === 123456789; // Replace with actual admin ID
  }
// Using the built-in userId filter is easier and more reliable
bot.on("message", ctx => {
  ctx.reply("Message from admin using userId filter");
}, filters.userId(123456789)); // Replace with actual admin ID

// Filter messages from a specific chat
bot.on("message", ctx => {
  ctx.reply("Message from an important group");
}, filters.chatId(-100123456789)); // Replace with actual group chat ID
  return false;
  return false;
}));
```


## Context Types

WorkerGram provides specialized context classes for different update types. Here's a reference for each context type:

### BaseContext

Base class for all contexts. All other context types extend this class.

**Properties:**
- `bot`: The Bot instance
- `update`: The raw update object from Telegram

**Methods:**
- `reply(text, options)`: Send a reply (implementation varies by context type)

### MessageContext

Used for handling message updates.

**Properties:**
- `message`: The message object
- All properties from BaseContext

**Methods:**
- `reply(text, options)`: Reply to the current message
- `editText(text, options)`: Edit the text of the current message
- `delete()`: Delete the current message
- `replyWithPhoto(photo, options)`: Send a photo in reply to the current message
- `replyWithDocument(document, options)`: Send a document in reply to the current message
- `getChat()`: Get information about the chat
- `banChatMember(userId, untilDate, revokeMessages)`: Ban a user from the chat
- `unbanChatMember(userId, onlyIfBanned)`: Unban a user from the chat

**Example:**
```typescript
bot.on('message', ctx => {
  // Access message properties
  const messageId = ctx.message.message_id;
  const chatId = ctx.message.chat.id;
  const text = ctx.message.text;
  
  // Reply to the message
  ctx.reply('Got your message!');
  
  // Send a photo in reply
  ctx.replyWithPhoto('https://example.com/image.jpg', {
    caption: 'Check out this image!'
  });
});
```

### CallbackQueryContext

Used for handling callback query updates (button clicks).

**Properties:**
- `callbackQuery`: The callback query object
- `message`: The message object associated with the callback query (if any)
- All properties from BaseContext

**Methods:**
- `answer(text, options)`: Answer the callback query
- `editText(text, options)`: Edit the text of the associated message
- `editReplyMarkup(replyMarkup, options)`: Edit the reply markup of the associated message
- `deleteMessage()`: Delete the associated message
- `reply(text, options)`: Reply to the associated message

**Example:**
```typescript
bot.on('callback_query', ctx => {
  // Access callback query data
  const queryId = ctx.callbackQuery.id;
  const data = ctx.callbackQuery.data;
  
  // Answer the callback query (shows a notification to user)
  ctx.answer('Button clicked!');
  
  // Edit the message that contained the button
  ctx.editText('You clicked the button!');
});
```

### ChatMemberUpdateContext

Used for handling chat member updates (joins, leaves, etc.).

**Properties:**
- `chatMemberUpdate`: The chat member update object
- `updateType`: The type of update ('chat_member' or 'my_chat_member')
- `oldStatus`: The previous status of the chat member
- `newStatus`: The new status of the chat member
- `user`: The user who was updated
- `chat`: The chat where the update occurred
- All properties from BaseContext

**Methods:**
- `isJoining()`: Check if this is a new member joining the chat
- `isLeaving()`: Check if this is a member leaving the chat
- `isPromoted()`: Check if this is a member being promoted
- `isDemoted()`: Check if this is a member being demoted
- `reply(text, options)`: Send a message to the chat
- `banUser(untilDate, revokeMessages)`: Ban the user from the chat
- `unbanUser(onlyIfBanned)`: Unban the user from the chat

**Example:**
```typescript
bot.on('chat_member', ctx => {
  // Check the type of member update
  if (ctx.isJoining()) {
    ctx.reply(`Welcome to the chat, ${ctx.user.first_name}!`);
  } else if (ctx.isLeaving()) {
    ctx.reply(`${ctx.user.first_name} has left the chat.`);
  } else if (ctx.isPromoted()) {
    ctx.reply(`${ctx.user.first_name} has been promoted!`);
  } else if (ctx.isDemoted()) {
    ctx.reply(`${ctx.user.first_name} has been demoted.`);
  }
  
  // Access the old and new status
  console.log(`Status changed from ${ctx.oldStatus} to ${ctx.newStatus}`);
});
```


## License

MIT