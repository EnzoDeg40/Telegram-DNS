# Telegram-DNS
At first I wanted to create a dashboard to quickly manage DNS records. Then I thought that going through Telegram commands was much easier.

## Installation 
```bash
git clone https://github.com/EnzoDeg40/Telegram-DNS.git
cd Telegram-DNS/
```

Create `.env` file with the following content. For `BOT_TOKEN`, you can get a token with [@BotFather](https://t.me/BotFather).
```bash
BOT_TOKEN="telegram_bot_token"
```
Optionally, you can also create permanent recording by adding the following to the `.env` file. You can also set the DNS port.
```bash
PERMANENT_RECORDS=[["example.apple", "192.168.0.42"],["example.pear", "192.168.0.69"]]
DNS_PORT=5333
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