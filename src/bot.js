// src/bot.js
import dotenv from "dotenv";
import { Bot } from "grammy";

dotenv.config();

// проверка токена
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Ошибка: не задан BOT_TOKEN в файле .env (или в переменных окружения).");
  process.exit(1);
}

// создаём бот и хэндлеры (без bot.start(), нужен для webhooks)
const bot = new Bot(token);

bot.command("start", (ctx) => ctx.reply("Привет! Я бот на Vercel 🚀"));
bot.command("help", (ctx) => ctx.reply("Список команд: /start /help"));

// обработчики необработанных ошибок
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// попытка зарегистрировать команды в Telegram (не критичная)
(async () => {
  try {
    await bot.api.setMyCommands([
      { command: "start", description: "Запустить бота" },
      { command: "help", description: "Помощь" },
    ]);
    console.log("Команды зарегистрированы.");
  } catch (err) {
    console.warn("Не удалось зарегистрировать команды:", err && err.message ? err.message : err);
  }
})();

export default bot;
