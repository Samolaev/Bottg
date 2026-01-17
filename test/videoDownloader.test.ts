import { detectPlatform, downloadVideo } from '../src/utils/videoDownloader';

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

console.log('\nTesting completed.');

// Для полного тестирования загрузки видео нужно запустить бота
console.log('\nTo fully test video downloading functionality, run the bot and send video links.');