# Telegram-DNS
At first I wanted to create a dashboard to quickly manage DNS records. Then I thought that going through Telegram commands was much easier.

## Installation 
Create .env file with the following content. You can get the token from [@BotFather](https://t.me/BotFather).
```bash
BOT_TOKEN="telegram_bot_token"
```

Install dependencies:
```bash
npm install
```
Run the bot:
```bash
npm start
```

## Packages used
- [dotenv](https://www.npmjs.com/package/dotenv)
- [dns2](https://www.npmjs.com/package/dns2)
- [node-telegram-bot-api](https://www.npmjs.com/package/node-telegram-bot-api)