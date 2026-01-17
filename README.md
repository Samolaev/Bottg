# Telegram Bot Vercel Boilerplate

Telegram Bot Vercel Boilerplate based on Node.js and [Telegraf](https://github.com/telegraf/telegraf) framework.

This template inspired by [Telegram Bot Boilerplate](https://github.com/yakovlevyuri/telegram-bot-boilerplate) for easily deploy to [Vercel](https://vercel.com).

[![Live Demo](https://img.shields.io/badge/Medium-12100E?style=for-the-badge&logo=medium&logoColor=white)](https://medium.com/@7rodma/deploy-a-serverless-telegram-chatbot-using-vercel-57665d942a58)

## Features

- Basic Telegram bot functionality
- Support for commands
- Download videos from YouTube, Instagram, and TikTok
- Automatic link detection in messages
- Error handling and user notifications

## Before you start

First rename `.env-sample` file to `.env` and fill in all necessary values.

```
BOT_TOKEN="<YOUR_BOT_API_TOKEN>"
```

## Start your local server

```
yarn
yarn dev
```

## Usage

The bot supports the following functionality:

### Video Download Feature
- Send `/download_video <link>` command to download videos from YouTube, Instagram, or TikTok
- Simply send a video link in any message and the bot will automatically detect and download it
- Supported platforms: YouTube, Instagram, TikTok
- Maximum file size: 50MB (Telegram limitation)

## Production

You can fork this template and do the necessary changes you need. Then you when are done with your changes simply goto [vercel git import](https://vercel.com/import/git).

Reference to [this update](https://vercel.com/docs/security/deployment-protection#migrating-to-standard-protection), you need turn off `Vercel Authentication`, Settings => Deployment Protection

Feel free to create PR!

## Demo

You can see a working version of the bot at [@Node_api_m_bot](https://t.me/Node_api_m_bot)
