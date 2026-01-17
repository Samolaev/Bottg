import axios from 'axios';
import { Context } from 'telegraf';
import createDebug from 'debug';

const debug = createDebug('bot:videoDownloader');

// Типы для результатов скачивания
export interface VideoDownloadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
  platform?: string | null;
}

// Функция определения платформы по URL
export function detectPlatform(url: string): string | null {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  } else if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) {
    return 'instagram';
  } else if (lowerUrl.includes('tiktok.com') || lowerUrl.includes('vm.tiktok.com')) {
    return 'tiktok';
  }
  
  return null;
}

// Функция для скачивания видео с помощью Cobalt API
export async function downloadWithCobalt(url: string): Promise<VideoDownloadResult> {
  try {
    debug(`Attempting to download video with Cobalt: ${url}`);
    
    const response = await axios.post('https://api.cobalt.tools/api/json', {
      url: url,
      filenamePattern: 'basic'
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; TGbot/1.0)'
      }
    });

    if (response.data && response.data.url) {
      return {
        success: true,
        url: response.data.url,
        platform: detectPlatform(url) || undefined,
        filename: response.data.filename || 'video.mp4'
      };
    } else {
      return {
        success: false,
        error: 'Cobalt API returned invalid response'
      };
    }
  } catch (error: any) {
    debug(`Cobalt download failed: ${error.message}`);
    return {
      success: false,
      error: `Cobalt download failed: ${error.message}`
    };
  }
}

// Функция для скачивания видео с помощью youtube-dl API
export async function downloadWithYtdl(url: string): Promise<VideoDownloadResult> {
  try {
    debug(`Attempting to download video with youtube-dl: ${url}`);
    
    // Попробуем использовать один из публичных API endpoints для youtube-dl
    const apiUrl = `https://api.youtubedl.org/v2?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl, {
      timeout: 30000
    });

    if (response.data && response.data.download_links && response.data.download_links.mp4) {
      return {
        success: true,
        url: response.data.download_links.mp4.url,
        platform: detectPlatform(url) || undefined,
        filename: response.data.title ? `${response.data.title}.mp4` : 'video.mp4'
      };
    } else {
      return {
        success: false,
        error: 'youtube-dl API returned invalid response'
      };
    }
  } catch (error: any) {
    debug(`youtube-dl download failed: ${error.message}`);
    return {
      success: false,
      error: `youtube-dl download failed: ${error.message}`
    };
  }
}

// Функция для скачивания видео с помощью ssstik.io
export async function downloadWithSsstik(url: string): Promise<VideoDownloadResult> {
  try {
    debug(`Attempting to download video with ssstik.io: ${url}`);
    
    // Для TikTok используем ssstik.io
    const response = await axios.get(`https://ssstik.io/abc?url=${encodeURIComponent(url)}`, {
      headers: {
        'Referer': 'https://ssstik.io/',
        'User-Agent': 'Mozilla/5.0 (compatible; TGbot/1.0)',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    // Извлекаем URL видео из ответа (потребуется парсинг HTML)
    const html = response.data;
    // Это упрощенный пример - в реальности потребуется более точный парсинг
    const videoMatch = html.match(/<a[^>]+href="(https:\/\/[^"]*\.mp4[^"]*)"/i);
    
    if (videoMatch && videoMatch[1]) {
      return {
        success: true,
        url: videoMatch[1],
        platform: 'tiktok',
        filename: 'tiktok_video.mp4'
      };
    } else {
      return {
        success: false,
        error: 'Could not extract video URL from ssstik.io response'
      };
    }
  } catch (error: any) {
    debug(`ssstik.io download failed: ${error.message}`);
    return {
      success: false,
      error: `ssstik.io download failed: ${error.message}`
    };
  }
}

// Функция для скачивания видео с помощью snaptik.app
export async function downloadWithSnaptik(url: string): Promise<VideoDownloadResult> {
  try {
    debug(`Attempting to download video with snaptik.app: ${url}`);
    
    const response = await axios.post('https://snaptik.app/abc.php', 
      new URLSearchParams({
        'url': url,
        'lang': 'en'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': 'https://snaptik.app/',
          'User-Agent': 'Mozilla/5.0 (compatible; TGbot/1.0)'
        }
      }
    );

    // Извлекаем URL видео из ответа (потребуется парсинг)
    const html = response.data;
    // Упрощенный пример извлечения
    const videoMatch = html.match(/<a[^>]+href="(https:\/\/[^"]*\.mp4[^"]*)"/i);
    
    if (videoMatch && videoMatch[1]) {
      return {
        success: true,
        url: videoMatch[1],
        platform: 'tiktok',
        filename: 'tiktok_video.mp4'
      };
    } else {
      return {
        success: false,
        error: 'Could not extract video URL from snaptik.app response'
      };
    }
  } catch (error: any) {
    debug(`snaptik.app download failed: ${error.message}`);
    return {
      success: false,
      error: `snaptik.app download failed: ${error.message}`
    };
  }
}

// Основная функция загрузки видео, которая выбирает подходящий метод
export async function downloadVideo(url: string): Promise<VideoDownloadResult> {
  const platform = detectPlatform(url);
  
  debug(`Detected platform: ${platform} for URL: ${url}`);
  
  if (!platform) {
    return {
      success: false,
      error: 'Unsupported platform. Currently supported: YouTube, Instagram, TikTok.'
    };
  }

  // Попробуем различные методы в порядке предпочтения
  const methods = [
    () => platform === 'tiktok' ? downloadWithSsstik(url) : Promise.resolve({ success: false, error: 'Not applicable' }),
    () => platform === 'tiktok' ? downloadWithSnaptik(url) : Promise.resolve({ success: false, error: 'Not applicable' }),
    () => downloadWithCobalt(url),
    () => downloadWithYtdl(url)
  ];

  for (const method of methods) {
    try {
      const result = await method();
      if (result.success) {
        return result;
      }
    } catch (error) {
      debug(`Method failed: ${error}`);
      continue;
    }
  }

  // Если все методы не сработали
  return {
    success: false,
    error: 'All download methods failed. Please try another link.'
  };
}

// Функция отправки видео пользователю
export async function sendVideoToUser(ctx: Context, videoResult: VideoDownloadResult) {
  if (!videoResult.success || !videoResult.url) {
    const errorMessage = videoResult.error || 'Неизвестная ошибка при загрузке видео';
    await ctx.reply(`❌ Ошибка при загрузке видео: ${errorMessage}`);
    return;
  }

  try {
    await ctx.reply('📥 Видео готово! Отправляю...');
    
    // Проверяем размер файла перед отправкой (Telegram ограничивает размер файла до 50MB для видео)
    // Для этого делаем HEAD запрос для получения размера
    try {
      const headResponse = await axios.head(videoResult.url);
      const contentLength = headResponse.headers['content-length'];
      
      if (contentLength) {
        const fileSizeInMB = parseInt(contentLength) / (1024 * 1024);
        
        if (fileSizeInMB > 50) {
          await ctx.reply(`⚠️ Видео слишком большое для отправки в Telegram (${fileSizeInMB.toFixed(2)} MB). Вы можете скачать его по ссылке: ${videoResult.url}`);
          return;
        }
      }
    } catch (headError) {
      debug(`Could not determine file size: ${headError}`);
      // Если не удалось получить размер файла, всё равно пробуем отправить
    }
    
    await ctx.replyWithVideo({
      url: videoResult.url
    }, {
      caption: `📹 Видео с ${videoResult.platform || 'неизвестной платформы'}`
    });
  } catch (error: any) {
    debug(`Failed to send video to user: ${error.message}`);
    await ctx.reply(`⚠️ Не удалось отправить видео напрямую, но вы можете скачать его по ссылке: ${videoResult.url}\n\nПопробуйте воспользоваться другим сервисом или уменьшить размер видео.`);
  }
}