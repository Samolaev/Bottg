// api/index.js
const { Telegraf } = require('telegraf');

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  console.error('❌ TELEGRAM_TOKEN is missing!');
  // Не бросаем ошибку здесь — иначе Vercel не сможет обработать запрос
  // Лучше вернуть 500 при попытке обработки
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

// Вспомогательная функция: читает тело запроса как строку
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
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    return res.end('Method Not Allowed');
  }

  try {
    // Читаем сырое тело
    const rawBody = await getRawBody(req);

    if (!rawBody) {
      console.error('❌ Empty request body');
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      return res.end('Bad Request: Empty body');
    }

    // Парсим JSON
    let update;
    try {
      update = JSON.parse(rawBody);
    } catch (e) {
      console.error('❌ Invalid JSON:', rawBody.substring(0, 200));
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      return res.end('Bad Request: Invalid JSON');
    }

    // Передаём в Telegraf
    await bot.handleUpdate(update, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
};