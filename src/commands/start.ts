import { Context } from 'telegraf';

const start = () => async (ctx: Context) => {
  await ctx.reply('🎬 Welcome to Video Downloader Bot!\n\nSend /download <URL> to download short videos from YouTube, Instagram, or TikTok.');
};

export { start };