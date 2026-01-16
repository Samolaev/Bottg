import { Context } from 'telegraf';
import axios from 'axios';
import YTDlpWrap from 'yt-dlp-wrap';

axios.defaults.timeout = 30000;

const ytDlpWrap = new YTDlpWrap('/tmp/yt-dlp');

const getPlatform = (url: string): string | null => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  return null;
};

const downloadWithCobalt = async (url: string) => {
  const response = await axios.post('https://api.cobalt.tools/api/json', {
    url,
    vQuality: '720'
  });
  if (response.data.status === 'success' || response.data.status === 'stream') {
    return response.data.url;
  }
  throw new Error('Cobalt failed');
};

// Для Vercel может быть сложно использовать yt-dlp в реальном времени
// Поэтому временно используем только cobalt и сервисы
const downloadWithYTDlp = async (url: string) => {
  throw new Error('YT-DLP temporarily disabled for Vercel deployment');
};

const downloadWithSSSTik = async (url: string) => {
  const response = await axios.get(`https://ssstik.io/abc?url=${encodeURIComponent(url)}`);
  if (response.data.video) {
    return response.data.video;
  }
  throw new Error('SSSTik failed');
};

const downloadWithSnaptik = async (url: string) => {
  const response = await axios.post('https://snaptik.app/action-2021.php', `url=${encodeURIComponent(url)}`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  if (response.data.video) {
    return response.data.video;
  }
  throw new Error('Snaptik failed');
};

const download = () => async (ctx: Context) => {
  const messageText = ctx.message && 'text' in ctx.message ? ctx.message.text : undefined;
  if (!messageText) return;
  const parts = messageText.split(' ');
  if (parts.length < 2) {
    await ctx.reply('Please provide a URL: /download <url>');
    return;
  }
  const url = parts[1];
  const platform = getPlatform(url);
  if (!platform) {
    await ctx.reply('Unsupported platform. Supported: YouTube, Instagram, TikTok');
    return;
  }
  await ctx.reply('Downloading...');
  try {
    const videoUrl = await downloadWithCobalt(url);
    await ctx.replyWithVideo(videoUrl);
  } catch (e) {
    try {
      if (platform === 'tiktok') {
        const videoUrl = await downloadWithSSSTik(url);
        await ctx.replyWithVideo(videoUrl);
      } else {
        const buffer = await downloadWithYTDlp(url);
        await ctx.replyWithVideo({ source: buffer, filename: 'video.mp4' });
      }
    } catch (e2) {
      try {
        if (platform === 'tiktok') {
          const videoUrl = await downloadWithSnaptik(url);
          await ctx.replyWithVideo(videoUrl);
        } else {
          await ctx.reply('Failed to download video');
        }
      } catch (e3) {
        await ctx.reply('Failed to download video');
      }
    }
  }
};

export { download };