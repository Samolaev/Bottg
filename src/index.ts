import { Telegraf, Context } from 'telegraf';

import { about, downloadVideoCommand } from './commands';
import { greeting } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

bot.command('about', about());
bot.command('download_video', downloadVideoCommand());
bot.on('message', (ctx: Context) => {
  // Сначала проверяем, есть ли в сообщении ссылка на видео
  // Если да - обрабатываем как видео, если нет - как обычное сообщение
  
  // Проверяем, что сообщение содержит текст
  if (ctx.message && 'text' in ctx.message && typeof ctx.message.text === 'string') {
    const messageText = ctx.message.text;
    const videoUrlRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|instagram\.com|instagr\.am|tiktok\.com|vm\.tiktok\.com)\/[^\s]+/gi;
    
    if (videoUrlRegex.test(messageText)) {
      // Если есть ссылка на видео, обрабатываем как видео
      import('./commands/downloadVideo').then(({ handleVideoLink }) => {
        handleVideoLink(ctx);
      }).catch(console.error);
      return; // Выходим, чтобы не обрабатывать как обычное сообщение
    }
  }
  
  // Если нет ссылки на видео, обрабатываем как обычное сообщение
  greeting()(ctx);
});

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);
