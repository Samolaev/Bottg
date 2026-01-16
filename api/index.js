// api/index.js
import { Telegraf } from 'telegraf';

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  throw new Error('❌ TELEGRAM_TOKEN is missing!');
}

const bot = new Telegraf(token);

bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  const message = `✅ Thanks for your message: *"${text}"*\nHave a great day! 👋🏻`;
  await ctx.replyWithMarkdown(message);
});

bot.catch((err) => {
  console.error('⚠️ Bot error:', err);
});

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const update = await request.json();

    // 🚀 Отправляем ответ Telegram немедленно
    // (это предотвращает таймаут)
    setTimeout(() => {
      bot.handleUpdate(update).catch(console.error);
    }, 0);

    // ✅ Возвращаем 200 OK сразу
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Handler error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}