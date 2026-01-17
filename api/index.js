// api/index.js
import { Telegraf } from 'telegraf';

// Создаём бота один раз
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// === Обработка команд ===
bot.start((ctx) => {
  const name = ctx.message.from.first_name || 'друг';
  ctx.reply(`Привет, ${name}! 👋\nЯ бот Bottg. Напиши мне что-нибудь!`);
});

bot.help((ctx) => {
  ctx.reply('Отправь мне любой текст, и я отвечу с подтверждением!');
});

// === Обработка любого текста ===
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  const message = `✅ Получено ваше сообщение: *"${text}"*\nСпасибо! 😊`;
  await ctx.replyWithMarkdown(message);
});

// === Обработка неизвестных типов сообщений ===
bot.on('message', (ctx) => {
  ctx.reply('Я понимаю только текстовые сообщения. Попробуйте написать что-нибудь!');
});

// === Обработка ошибок ===
bot.catch((err, ctx) => {
  console.error(`⚠️ Ошибка при обработке сообщения от ${ctx?.message?.from?.id}:`, err.message);
});

// === Экспорт для Vercel ===
export default async function handler(request) {
  // Разрешаем только POST
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // Читаем обновление от Telegram
    const update = await request.json();

    // 🔥 Отправляем ответ Telegram немедленно (предотвращает 401 и таймауты)
    setImmediate(() => {
      bot.handleUpdate(update).catch(console.error);
    });

    // ✅ Возвращаем 200 OK сразу
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('❌ Ошибка в обработчике:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}