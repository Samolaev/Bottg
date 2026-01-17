import { Context } from 'telegraf';
import createDebug from 'debug';
import { downloadVideo, sendVideoToUser, detectPlatform, VideoDownloadResult } from '../utils/videoDownloader';

const debug = createDebug('bot:downloadVideo_command');

const downloadVideoCommand = () => async (ctx: Context) => {
  // Проверяем, что сообщение существует и содержит текст
  if (!ctx.message || !('text' in ctx.message) || typeof ctx.message.text !== 'string') {
    await ctx.reply('⚠️ Пожалуйста, укажите ссылку на видео после команды /download_video\nПример: /download_video https://www.youtube.com/watch?v=...');
    return;
  }
  
  const messageText = ctx.message.text;
  const args = messageText.split(' ');
  
  if (args.length < 2) {
    await ctx.reply('⚠️ Пожалуйста, укажите ссылку на видео после команды /download_video\nПример: /download_video https://www.youtube.com/watch?v=...');
    return;
  }
  
  const url = args[1].trim();
  
  // Проверяем, является ли аргумент действительной ссылкой
  try {
    new URL(url);
  } catch (error) {
    await ctx.reply('❌ Неверный формат ссылки. Пожалуйста, укажите действительную ссылку на видео с YouTube, Instagram или TikTok.');
    return;
  }
  
  // Проверяем, поддерживается ли платформа
  const platform = detectPlatform(url);
  if (!platform) {
    await ctx.reply('❌ Данная платформа не поддерживается. Поддерживаются: YouTube, Instagram, TikTok.');
    return;
  }
  
  debug(`Received video download request for URL: ${url}`);
  
  try {
    await ctx.reply('🔄 Анализирую ссылку и начинаю загрузку видео...');
    
    // Отправляем сообщение о процессе
    const progressMsg = await ctx.reply('🔍 Поиск подходящего источника...');
    
    // Запускаем загрузку видео с обработкой таймаута
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout after 45 seconds')), 45000); // 45 секунд на всю операцию
    });
    
    const downloadPromise = downloadVideo(url);
    
    const result = await Promise.race([downloadPromise, timeoutPromise]) as VideoDownloadResult;
    
    // Удаляем сообщение о процессе
    try {
      if (ctx.chat) {
        await ctx.telegram.deleteMessage(ctx.chat.id, progressMsg.message_id);
      }
    } catch (deleteError) {
      // Игнорируем ошибку удаления, если сообщение уже удалено
      debug(`Could not delete progress message: ${deleteError}`);
    }
    
    await sendVideoToUser(ctx, result);
  } catch (error: any) {
    debug(`Error downloading video: ${error.message}`);
    await ctx.reply(`❌ Произошла ошибка при загрузке видео: ${error.message || 'Operation timed out'}`);
  }
};

// Обработка сообщений, содержащих ссылки на видео
const handleVideoLink = async (ctx: Context) => {
  // Проверяем, что сообщение существует и содержит текст
  if (!ctx.message || !('text' in ctx.message) || typeof ctx.message.text !== 'string') {
    return;
  }
  
  const messageText = ctx.message.text || '';
  
  // Проверяем, содержит ли сообщение ссылку на поддерживаемую платформу
  const videoUrlRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|instagram\.com|instagr\.am|tiktok\.com|vm\.tiktok\.com)\/[^\s]+/gi;
  const matches = messageText.match(videoUrlRegex);
  
  if (matches && matches.length > 0) {
    const url = matches[0];
    
    debug(`Detected video link in message: ${url}`);
    
    try {
      await ctx.reply('🔄 Обнаружена ссылка на видео. Начинаю загрузку...');
      
      // Отправляем сообщение о процессе
      const progressMsg = await ctx.reply('🔍 Поиск подходящего источника...');
      
      // Запускаем загрузку видео с обработкой таймаута
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout after 45 seconds')), 45000); // 45 секунд на всю операцию
      });
      
      const downloadPromise = downloadVideo(url);
      
      const result = await Promise.race([downloadPromise, timeoutPromise]) as VideoDownloadResult;
      
      // Удаляем сообщение о процессе
      try {
        if (ctx.chat) {
          await ctx.telegram.deleteMessage(ctx.chat.id, progressMsg.message_id);
        }
      } catch (deleteError) {
        // Игнорируем ошибку удаления, если сообщение уже удалено
        debug(`Could not delete progress message: ${deleteError}`);
      }
      
      await sendVideoToUser(ctx, result);
    } catch (error: any) {
      debug(`Error downloading video from link: ${error.message}`);
      await ctx.reply(`❌ Произошла ошибка при загрузке видео: ${error.message || 'Operation timed out'}`);
    }
  }
};

export { downloadVideoCommand, handleVideoLink };