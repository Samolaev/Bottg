import { detectPlatform } from '../src/utils/videoDownloader';

// Простой тест для проверки работы функций
console.log('Testing video downloader functionality...\n');

// Тест 1: Проверка определения платформы
console.log('Test 1: Platform detection');
const testUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ',
  'https://www.instagram.com/p/C1t3Nrgv3rU/',
  'https://www.tiktok.com/@user/video/7123456789012345678',
  'https://vm.tiktok.com/TTPdk6abcde/',
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
  'https://www.youtube.com/v/dQw4w9WgXcQ'
];

youtubeUrls.forEach(url => {
  // Импортируем функцию извлечения ID
  const extractYouTubeId = (url: string): string | null => {
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
  };

  const videoId = extractYouTubeId(url);
  console.log(`URL: ${url} -> ID: ${videoId}`);
});

console.log('\nTesting completed.');

// Для полного тестирования загрузки видео нужно запустить бота
console.log('\nTo fully test video downloading functionality, run the bot and send video links.');
console.log('Note: Actual video downloading requires working external APIs and may fail in test environment.');