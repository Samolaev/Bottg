from flask import Flask, request
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters
from downloader import download_video
import os

app = Flask(__name__)

TOKEN = os.getenv('TELEGRAM_TOKEN')
if not TOKEN:
    raise ValueError("TELEGRAM_TOKEN not set")

application = Application.builder().token(TOKEN).build()

async def start(update: Update, context):
    await update.message.reply_text('Отправь ссылку на видео с YouTube, Instagram или TikTok для скачивания')

async def handle_message(update: Update, context):
    url = update.message.text.strip()
    if not url.startswith(('http://', 'https://')):
        await update.message.reply_text('Пожалуйста, отправь корректную ссылку на видео')
        return

    await update.message.reply_text('Скачиваю видео...')
    video_bytes, error = download_video(url)
    if error:
        await update.message.reply_text(f'Ошибка скачивания: {error}')
    else:
        await update.message.reply_document(video_bytes, filename='video.mp4')

application.add_handler(CommandHandler('start', start))
application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

@app.route('/', methods=['GET', 'POST'])
def webhook():
    if request.method == 'POST':
        update = Update.de_json(request.get_json(force=True), application.bot)
        application.process_update(update)
        return 'ok'
    else:
        return 'Bot is running'

if __name__ == '__main__':
    app.run()