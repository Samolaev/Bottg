import { detectPlatform } from '../src/utils/videoDownloader';

// Импортируем функцию извлечения ID для тестирования
const extractYouTubeId = (url: string): string | null => {
  // Очищаем URL от пробелов и декодируем
  const cleanUrl = url.trim();

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)(?:\?|$)/
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match?.[1]) {
      const videoId = match[1];
      console.log(`  Pattern match: "${match[1]}" for pattern: ${pattern}`);
      // Проверяем валидность ID (5–11 символов, только буквы, цифры, дефисы и подчеркивания)
      if (/^[a-zA-Z0-9_-]{5,11}$/.test(videoId)) {
        return videoId;
      } else {
        console.log(`  ID "${videoId}" failed validation`);
      }
    }
  }
  return null;
};

// Простой тест для проверки работы функций
console.log('Testing video downloader functionality...\n');

// Тест 1: Проверка определения платформы
console.log('Test 1: Platform detection');
const testUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ',
  'https://www.youtube.com/shorts/lAO76nuAFwE?feature=share',
  'https://www.instagram.com/p/C1t3Nrgv3rU/',
  'https://www.instagram.com/reel/DTgCg5VEgt0/?utm_source=ig_web_copy_link',
  'https://www.tiktok.com/@user/video/7123456789012345678',
  'https://vm.tiktok.com/TTPdk6abcde/',
  'https://vt.tiktok.com/ZS5TgCSpA/',
  'https://example.com/not-supported'
];

testUrls.forEach(url => {
  const platform = detectPlatform(url);
  console.log(`URL: ${url.substring(0, 50)}... -> Platform: ${platform}`);
});

// Тест 2: Проверка извлечения YouTube ID
console.log('\nTest 2: YouTube ID extraction');
const youtubeUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://www.youtube.com/v/dQw4w9WgXcQ',
  'https://www.youtube.com/shorts/lAO76nuAFwE?feature=share'
];

youtubeUrls.forEach(url => {
  const videoId = extractYouTubeId(url);
  console.log(`URL: ${url} -> ID: ${videoId}`);
});

console.log('\nTesting completed.');

console.log('\nTesting completed.');

// Для полного тестирования загрузки видео нужно запустить бота
console.log('\nTo fully test video downloading functionality, run the bot and send video links.');
console.log('Note: Actual video downloading requires working external APIs and may fail in test environment.');