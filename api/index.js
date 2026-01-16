// api/index.js
import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.on('text', (ctx) => ctx.reply(`✅ Echo: ${ctx.message.text}`));

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('405', { status: 405 });
  const update = await req.json();
  bot.handleUpdate(update).catch(console.error);
  return new Response('OK', { status: 200 }); // ← КЛЮЧЕВОЙ МОМЕНТ
}