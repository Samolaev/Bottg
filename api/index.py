import asyncio
import json
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters
from downloader import download_video
import os

TOKEN = os.getenv('TELEGRAM_TOKEN')

if TOKEN:
    application = Application.builder().token(TOKEN).build()
else:
    application = None

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

if application:
    application.add_handler(CommandHandler('start', start))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

def handler(event, context):
    if not TOKEN:
        return {'statusCode': 500, 'body': 'TELEGRAM_TOKEN not set'}
    try:
        if event.get('httpMethod') == 'POST':
            body = event.get('body', '')
            if body:
                data = json.loads(body)
                update = Update.de_json(data, application.bot)
                asyncio.run(application.process_update(update))
                return {'statusCode': 200, 'body': 'ok'}
            else:
                return {'statusCode': 400, 'body': 'No body'}
        else:
            return {'statusCode': 200, 'body': 'Bot is running'}
    except Exception as e:
        return {'statusCode': 500, 'body': str(e)}
