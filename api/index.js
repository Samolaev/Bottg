const TelegramBot = require('node-telegram-bot-api');
const { downloadVideo } = require('../downloader');

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
    throw new Error('TELEGRAM_TOKEN not set');
}

const bot = new TelegramBot(token);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        bot.processUpdate(req.body);
        res.status(200).send('OK');
    } else {
        res.status(200).send('Bot is running');
    }
}

// Обработчики сообщений
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Отправь ссылку на видео с YouTube, Instagram или TikTok для скачивания');
});

bot.on('message', async (msg) => {
    const url = msg.text;
    if (!url || !url.startsWith('http')) return;

    try {
        bot.sendMessage(msg.chat.id, 'Скачиваю видео...');
        const videoBuffer = await downloadVideo(url);
        bot.sendDocument(msg.chat.id, videoBuffer, {}, { filename: 'video.mp4' });
    } catch (error) {
        bot.sendMessage(msg.chat.id, `Ошибка скачивания: ${error.message}`);
    }
});