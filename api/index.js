// api/index.js
import { Telegraf } from 'telegraf';

// Создаём бота один раз (ленивая инициализация)
let bot;

function getBot() {
  if (!bot) {
    const token = process.env.TELEGRAM_TOKEN;
    if (!token) {
      throw new Error('❌ TELEGRAM_TOKEN is missing in Vercel environment!');
    }
    bot = new Telegraf(token);
    
    bot.on('text', async (ctx) => {
      const text = ctx.message.text;
      const message = `✅ Thanks for your message: *"${text}"*\nHave a great day! 👋🏻`;
      await ctx.replyWithMarkdown(message);
    });

    bot.catch((err) => {
      console.error('⚠️ Bot error:', err);
    });
  }
  return bot;
}

export default async function handler(request) {
  // Логируем наличие токена
  console.log('🔍 TELEGRAM_TOKEN length:', process.env.TELEGRAM_TOKEN?.length || 'MISSING');

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const update = await request.json();

    // Обрабатываем в фоне
    setImmediate(() => {
      getBot().handleUpdate(update).catch(console.error);
    });

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Handler error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}