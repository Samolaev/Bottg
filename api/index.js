// api/index.js
const { Telegraf } = require('telegraf');

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  console.error('❌ TELEGRAM_TOKEN is missing!');
  throw new Error('TELEGRAM_TOKEN is required');
}

const bot = new Telegraf(token);

bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  const message = `✅ Thanks for your message: *"${text}"*\nHave a great day! 👋🏻`;
  await ctx.replyWithMarkdown(message);
});

bot.catch((err) => {
  console.error('⚠️ Bot error:', err);
});

// Вспомогательная функция для чтения тела запроса
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  // Разрешаем только POST
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    return res.end('Method Not Allowed');
  }

  try {
    // Читаем сырое тело запроса
    const rawBody = await getRawBody(req);
    
    // Парсим JSON
    let update;
    try {
      update = JSON.parse(rawBody);
    } catch (e) {
      console.error('❌ Invalid JSON:', rawBody);
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      return res.end('Bad Request: Invalid JSON');
    }

    // Передаём обновление в Telegraf
    await bot.handleUpdate(update, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
};