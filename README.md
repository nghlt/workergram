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
    
    // Register command handlers - new simplified syntax
    bot.onCommand('start', async (ctx) => {
      await ctx.reply('Hello! I am a Telegram bot powered by WorkerGram.');
    });
    
    bot.onCommand('help', async (ctx) => {
      await ctx.reply('This is a help message. You can use the following commands:\n' +
        '/start - Start the bot\n' +
        '/help - Show this help message');
    });
    
    // Handle regular text messages
    bot.onUpdate('message', async (ctx) => {
      if (ctx.message.text) {
        await ctx.reply(`You said: ${ctx.message.text}`);
      }
    }, filters.custom(update => 
      'message' in update && 
      update.message?.text && 
      !update.message.text.startsWith('/')
    ));
    
    // Handle new members joining
    bot.onUpdate('chat_member', async (ctx) => {
      if (ctx.isJoining()) {
        await ctx.reply(`Welcome to the group, ${ctx.user.displayName}!`);
      }
    }, filters.memberStatusChange('join'));
    
    // If this is a POST request from Telegram, process it as an update
    if (request.method === 'POST') {
      try {
        // Parse the request body as JSON
        const update = await request.json();
        
        // Process the update
        await bot.processUpdate(update);
        
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
   // Use onUpdate for handling update types
   bot.onUpdate('message', (ctx) => {
     ctx.reply('Hello!');
   });
   
   bot.onUpdate('callback_query', (ctx) => {
     ctx.answer('Button clicked!');
   });
   
   // Use onCommand for handling commands (recommended)
   bot.onCommand('start', (ctx) => {
     ctx.reply('Bot started!');
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

// Set up handlers (notice the new method names)
bot.onCommand('start', startHandler);
bot.onUpdate('message', msgHandler);
bot.onUpdate('callback_query', cbQueryHandler);

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
bot.onUpdate('message', ctx => {
  ctx.reply('Nice photo!');
}, filters.custom(update => {
  return 'message' in update && 
         update.message && 
         'photo' in update.message && 
         Array.isArray(update.message.photo) && 
         update.message.photo.length > 0;
}));

// Match messages from a specific user
bot.onUpdate('message', ctx => {
  ctx.reply('Message from admin');
}, filters.custom(update => {
  if ('message' in update && update.message?.from) {
    return update.message.from.id === 123456789; // Replace with actual admin ID
  }
// Using the built-in userId filter is easier and more reliable
bot.onUpdate("message", ctx => {
  ctx.reply("Message from admin using userId filter");
}, filters.userId(123456789)); // Replace with actual admin ID

// Filter messages from a specific chat
bot.onUpdate("message", ctx => {
  ctx.reply("Message from an important group");
}, filters.chatId(-100123456789)); // Replace with actual group chat ID
  return false;
  return false;
}));
```


## Bot Instance Methods and Properties

The `Bot` class provides a comprehensive set of methods for interacting with the Telegram Bot API.

### Core Methods

**Handler Registration:**
- `onCommand(command, handler, filter?)`: Register a handler for a specific command (NEW)
- `onUpdate(event, handler, filter?)`: Register a handler for an update type
- `processUpdate(update)`: Process a Telegram update object

**Message Methods:**
- `sendMessage(chatId, text, options?)`: Send a text message to a chat
- `sendPhoto(chatId, photo, options?)`: Send a photo to a chat
- `sendDocument(chatId, document, options?)`: Send a document to a chat
- `forwardMessage(chatId, fromChatId, messageId, options?)`: Forward a message
- `copyMessage(chatId, fromChatId, messageId, options?)`: Copy a message

**Interactive Methods:**
- `answerCallbackQuery(callbackQueryId, options?)`: Answer a callback query

**Chat Management Methods:**
- `banChatMember(chatId, userId, untilDate?, revokeMessages?)`: Ban a user from a chat
- `unbanChatMember(chatId, userId, onlyIfBanned?)`: Unban a user
- `restrictChatMember(chatId, userId, permissions, untilDate?)`: Restrict a user
- `promoteChatMember(chatId, userId, options?)`: Promote a user
- `setChatAdministratorCustomTitle(chatId, userId, customTitle)`: Set custom title

**Forum Topic Management Methods:**
- `createForumTopic(chatId, name, options?)`: Create a forum topic
- `editForumTopic(chatId, messageThreadId, options)`: Edit a forum topic
- `closeForumTopic(chatId, messageThreadId)`: Close a forum topic
- `reopenForumTopic(chatId, messageThreadId)`: Reopen a forum topic
- `deleteForumTopic(chatId, messageThreadId)`: Delete a forum topic
- `unpinAllForumTopicMessages(chatId, messageThreadId)`: Unpin all messages
- `hideGeneralForumTopic(chatId)`: Hide the general forum topic
- `unhideGeneralForumTopic(chatId)`: Unhide the general forum topic

**Webhook Methods:**
- `setWebhook(url, options?)`: Set a webhook for updates
- `deleteWebhook(dropPendingUpdates?)`: Delete the webhook
- `getWebhookInfo()`: Get information about the webhook

**Info Methods:**
- `getMe()`: Get information about the bot
- `getChatMember(chatId, userId)`: Get info about a chat member

## Context Types

WorkerGram provides specialized context classes for different update types, each with structured property groups. Here's a reference for each context type:

### BaseContext

Base class for all contexts. All other context types extend this class.

**Properties:**
- `bot`: The Bot instance
- `update`: The raw update object from Telegram
- `userId`: ID of the user who triggered the update
- `user`: Structured user information object
  - `id`: User ID
  - `firstName`: First name
  - `lastName`: Last name (if available)
  - `fullName`: Combined first and last name
  - `username`: Username (if available)
  - `displayName`: User's display name (full name with username)

### MessageContext

Used for handling message updates.

**Properties:**
- `chatId`: ID of the chat where the message was sent
- `messageId`: ID of the message
- `text`: Text content of the message
- `chat`: Structured chat information object
  - `id`: Chat ID
  - `topicId`: Topic ID for forum channels (if available)
  - `type`: Chat type (private, group, supergroup, channel)
  - `title`: Chat title (for groups, supergroups, channels)
- `message`: Structured message information object
  - `id`: Message ID
  - `text`: Message text
  - `command`: Command, if the message contains one
  - `commandPayload`: Command payload (text after command)
  - `date`: Message date
  - `isEdited`: Whether the message was edited
  - `type`: Type of message (text, photo, video, etc.)
- All properties from BaseContext

**Methods:**
- `reply(text, options, asReply?)`: Reply to the current message (with optional quoting)
- `editText(text, options)`: Edit the text of the current message
- `deleteMessage()`: Delete the current message (renamed from delete())
- `replyWithPhoto(photo, options, asReply?)`: Send a photo in reply
- `replyWithDocument(document, options, asReply?)`: Send a document in reply
- `forwardTo(chatId, options?)`: Forward this message to another chat
- `copyTo(chatId, options?)`: Copy this message to another chat
- `getChat()`: Get information about the chat
- `banChatMember(userId?, untilDate?, revokeMessages?)`: Ban a user
- `unbanChatMember(userId?, onlyIfBanned?)`: Unban a user
- `isChatMemberOf(chatId)`: Check if the user is a member of another chat
- `restrictChatMember(permissions, untilDate?, chatId?)`: Restrict a user
- `createForumTopic(name, options?)`: Create a forum topic
- `editForumTopic(options)`: Edit a forum topic
- `closeForumTopic()`: Close a forum topic
- `reopenForumTopic()`: Reopen a forum topic
- `deleteForumTopic()`: Delete a forum topic

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
- `chatId`: ID of the chat where the callback query came from (if available)
- `messageId`: ID of the message with the inline keyboard (if available)
- `callbackData`: Data attached to the callback button
- `chat`: Structured chat information object (if available)
- `message`: Structured message information object (if available)
- `callback`: Structured callback query information object
  - `id`: Callback query ID
  - `chatInstance`: Chat instance string
  - `data`: Callback data
  - `gameShortName`: Game short name (for game buttons)
  - `inlineMessageId`: Inline message ID (for inline keyboards)
- All properties from BaseContext

**Methods:**
- `answer(text, options)`: Answer the callback query
- `reply(text, options, asReply?)`: Reply to the associated message (with optional quoting)
- `editText(text, options)`: Edit the text of the associated message
- `editReplyMarkup(replyMarkup, options)`: Edit the reply markup
- `deleteMessage()`: Delete the associated message
- `replyWithPhoto(photo, options, asReply?)`: Send a photo in reply
- `replyWithDocument(document, options, asReply?)`: Send a document in reply
- `banChatMember(userId, untilDate?, revokeMessages?)`: Ban a user
- `unbanChatMember(userId, onlyIfBanned?)`: Unban a user
- `isChatMemberOf(chatId)`: Check if the user is a member of another chat

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
- `chatId`: ID of the chat where the update occurred
- `chat`: Structured chat information object
  - `id`: Chat ID
  - `type`: Chat type (group, supergroup, channel)
  - `title`: Chat title
- `memberUpdate`: Structured member update information object
  - `from`: User who triggered the update
  - `oldInfo`: Previous chat member info
  - `newInfo`: New chat member info
  - `oldStatus`: Previous status
  - `newStatus`: New status
  - `updateType`: Type of update (chat_member or my_chat_member)
- All properties from BaseContext

**Methods:**
- `isJoining()`: Check if this is a new member joining the chat
- `isLeaving()`: Check if this is a member leaving the chat
- `isPromoted()`: Check if this is a member being promoted
- `isDemoted()`: Check if this is a member being demoted
- `reply(text, options, asReply?)`: Send a message to the chat (with optional quoting)
- `banChatMember(userId?, untilDate?, revokeMessages?)`: Ban the user from the chat (renamed from banUser())
- `unbanChatMember(userId?, onlyIfBanned?)`: Unban the user (renamed from unbanUser())
- `isChatMemberOf(chatId)`: Check if the user is a member of another chat
- `restrictChatMember(permissions, untilDate?, chatId?)`: Restrict a user

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


### InlineQueryContext

Used for handling inline query updates from users typing @botname in a chat.

**Properties:**
- `query`: The query text entered by the user
- `inlineQuery`: Structured inline query information object
  - `id`: Inline query ID
  - `query`: Query text
  - `offset`: Pagination offset
  - `chatType`: Type of chat where the query was made
- All properties from BaseContext

**Methods:**
- `answer(results, options?)`: Answer the inline query with results
- `answerWithResults(results, options?)`: Alias for answer()
- `isChatMemberOf(chatId)`: Check if the user is a member of another chat
- Helper methods for creating inline query results:
  - `createArticleResult(id, title, description, text, options?)`
  - `createPhotoResult(id, photoUrl, thumbnailUrl, title?, options?)`
  - `createDocumentResult(id, title, documentUrl, thumbnailUrl, options?)`
  - `createVideoResult(id, title, videoUrl, thumbnailUrl, options?)`
  - `createLocationResult(id, title, latitude, longitude, options?)`
- `generateResultId()`: Generate a unique ID for inline query results

### EditedMessageContext

Used for handling edited message updates.

**Properties:**
- `chatId`: ID of the chat where the message was edited
- `messageId`: ID of the edited message
- `text`: Text content of the edited message (if available)
- `chat`: Structured chat information object
- `message`: Structured message information object
- All properties from BaseContext

**Methods:**
- `reply(text, options, asReply?)`: Reply to the edited message (with optional quoting)
- `deleteMessage()`: Delete the edited message
- `replyWithPhoto(photo, options, asReply?)`: Send a photo in reply
- `replyWithDocument(document, options, asReply?)`: Send a document in reply
- `forwardTo(chatId, options?)`: Forward this message to another chat
- `copyTo(chatId, options?)`: Copy this message to another chat
- `banChatMember(userId?, untilDate?, revokeMessages?)`: Ban a user
- `unbanChatMember(userId?, onlyIfBanned?)`: Unban a user
- `isChatMemberOf(chatId)`: Check if the user is a member of another chat

## License

MIT