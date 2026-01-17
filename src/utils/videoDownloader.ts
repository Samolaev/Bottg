// src/utils/videoDownloader.ts
import axios from 'axios';
import { Context } from 'telegraf';
import createDebug from 'debug';

const debug = createDebug('bot:videoDownloader');

// Типы
export interface VideoDownloadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
  platform?: string | null;
  fallbackMessage?: string; // Для случаев, когда автоматика не работает
}

// Определяем платформу
export function detectPlatform(url: string): string | null {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
  if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) return 'instagram';
  if (lowerUrl.includes('tiktok.com') || lowerUrl.includes('vm.tiktok.com')) return 'tiktok';
  return null;
}

// Вспомогательная функция: безопасный GET запрос с retry
async function fetchWithRetry<T>(
  url: string,
  options: any = {},
  retries = 2,
  delayMs = 2000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://ssstik.io/',
          ...options.headers
        },
        ...options
      });
      return response.data as T;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      debug(`Attempt ${i + 1} failed: ${errorMessage}`);
      if (i < retries) await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw lastError;
}

// Вспомогательная функция: безопасный POST запрос с retry
async function postWithRetry<T>(
  url: string,
  data: any,
  options: any = {},
  retries = 2,
  delayMs = 2000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await axios.post(url, data, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      return response.data as T;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      debug(`POST attempt ${i + 1} failed: ${errorMessage}`);
      if (i < retries) await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw lastError;
}

// YouTube: используем альтернативный API
export async function downloadFromYouTube(url: string): Promise<VideoDownloadResult> {
  try {
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return { success: false, error: 'Invalid YouTube URL' };
    }

    // Альтернатива 1: cobalt.tools (открытый, без водяных знаков, работает из Vercel)
    try {
      const cobaltResponse = await postWithRetry<any>(
        `https://api.cobalt.tools/api/json`,
        {
          url: `https://www.youtube.com/watch?v=${videoId}`,
          downloadMode: "audio+video"
        }
      );

      if (cobaltResponse.status === 'success' && cobaltResponse.url) {
        return {
          success: true,
          url: cobaltResponse.url,
          platform: 'youtube',
          filename: `youtube_${videoId}.mp4`
        };
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      debug('Cobalt failed:', errorMessage);
    }

    // Fallback: дать ссылку на сайт
    return {
      success: false,
      platform: 'youtube',
      fallbackMessage: `📹 Не удалось скачать видео автоматически.\n\n👉 Откройте в браузере: https://cobalt.tools/\nВставьте ссылку: ${url}`
    };

  } catch (error: any) {
    debug(`YouTube download error: ${error.message}`);
    return {
      success: false,
      error: 'Ошибка при обработке YouTube-ссылки',
      fallbackMessage: `📹 Попробуйте скачать вручную: https://cobalt.tools/`
    };
  }
}

// TikTok: ssstik.io + fallback
export async function downloadFromTikTok(url: string): Promise<VideoDownloadResult> {
  try {
    // Основной метод: ssstik.io
    try {
      const apiUrl = `https://ssstik.io/abc?url=dl&id=${encodeURIComponent(url)}`;
      const html = await fetchWithRetry<string>(apiUrl, { responseType: 'text' });

      // Извлекаем прямую ссылку из HTML (парсинг, так как API закрыт)
      const match = html.match(/<a[^>]*href="([^"]*\.mp4[^"]*)"[^>]*>Download/);
      if (match && match[1]) {
        const cleanUrl = match[1].replace(/&amp;/g, '&');
        return {
          success: true,
          url: cleanUrl,
          platform: 'tiktok',
          filename: 'tiktok_video.mp4'
        };
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      debug('ssstik.io failed:', errorMessage);
    }

    // Fallback: инструкция
    return {
      success: false,
      platform: 'tiktok',
      fallbackMessage: `📹 Не удалось скачать видео.\n\n👉 Перейдите на https://ssstik.io/\nВставьте ссылку и нажмите "Save TikTok"`
    };

  } catch (error: any) {
    debug(`TikTok download error: ${error.message}`);
    return {
      success: false,
      error: 'Ошибка при обработке TikTok-ссылки',
      fallbackMessage: `📹 Скачайте вручную: https://ssstik.io/`
    };
  }
}

// Instagram: используем проверенный API или fallback
export async function downloadFromInstagram(url: string): Promise<VideoDownloadResult> {
  try {
    // Пробуем ваш API
    try {
      const data = await fetchWithRetry<any>(
        `https://instagram-downloader-api.vercel.app/api/download?url=${encodeURIComponent(url)}`
      );
      if (data?.video_url) {
        return {
          success: true,
          url: data.video_url,
          platform: 'instagram',
          filename: 'instagram_video.mp4'
        };
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      debug('Instagram API failed:', errorMessage);
    }

    // Fallback: инструкция
    return {
      success: false,
      platform: 'instagram',
      fallbackMessage: `📸 Не удалось скачать видео.\n\n👉 Откройте в браузере: https://savefrom.net/\nВставьте ссылку: ${url}`
    };

  } catch (error: any) {
    debug(`Instagram download error: ${error.message}`);
    return {
      success: false,
      error: 'Ошибка при обработке Instagram-ссылки',
      fallbackMessage: `📸 Скачайте вручную: https://savefrom.net/`
    };
  }
}

// Извлечение YouTube ID
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

// Основная функция
export async function downloadVideo(url: string): Promise<VideoDownloadResult> {
  const platform = detectPlatform(url);
  if (!platform) {
    return {
      success: false,
      error: 'Поддерживаются только YouTube, TikTok и Instagram.'
    };
  }

  try {
    debug(`Starting download for ${platform}: ${url}`);

    switch (platform) {
      case 'youtube': return await downloadFromYouTube(url);
      case 'tiktok': return await downloadFromTikTok(url);
      case 'instagram': return await downloadFromInstagram(url);
      default: return { success: false, error: 'Неподдерживаемая платформа' };
    }
  } catch (error: any) {
    debug(`Unexpected error in downloadVideo: ${error.message}`);
    return {
      success: false,
      error: 'Неожиданная ошибка при обработке',
      fallbackMessage: 'Попробуйте позже или скачайте вручную.'
    };
  }
}

// Отправка пользователю
export async function sendVideoToUser(ctx: Context, result: VideoDownloadResult) {
  if (result.success && result.url) {
    try {
      await ctx.reply('📥 Видео готово! Отправляю...');

      // Проверка размера (опционально)
      try {
        const head = await axios.head(result.url, { timeout: 5000 });
        const size = parseInt(head.headers['content-length'] || '0');
        if (size > 50 * 1024 * 1024) { // >50 MB
          await ctx.reply(`⚠️ Видео слишком большое (${(size / (1024 * 1024)).toFixed(1)} MB).\nСкачайте по ссылке: ${result.url}`);
          return;
        }
      } catch (e) {
        debug('Could not check file size');
      }

      await ctx.replyWithVideo({ url: result.url }, {
        caption: `📹 Видео с ${result.platform || 'платформы'}`
      });
    } catch (e) {
      debug('Failed to send video directly');
      await ctx.reply(`✅ Найдено видео!\nСкачайте по ссылке: ${result.url}`);
    }
  } else {
    const msg = result.fallbackMessage || `❌ ${result.error || 'Не удалось обработать ссылку.'}`;
    await ctx.reply(msg);
  }
}