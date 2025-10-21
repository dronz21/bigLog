// === Импорты ===
import 'dotenv/config';
import express from "express";
import { Bot, webhookCallback } from "grammy";   // ✅ добавили Bot
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";

// === Инициализация бота ===
const bot = new Bot(process.env.BOT_TOKEN); // ✅ создаём объект бота
console.log("🤖 Бот запущен с токеном:", process.env.BOT_TOKEN ? "✅ найден" : "❌ отсутствует");

// === Подключение к Supabase ===
console.log("Supabase URL:", process.env.SUPABASE_URL);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// === Подключение к Redis ===
console.log("Upstash URL:", process.env.UPSTASH_URL);
const redis = new Redis({
  url: process.env.UPSTASH_URL,
  token: process.env.UPSTASH_TOKEN,
});

// Проверка Redis
redis.set("test_key", "test_value")
  .then(() => console.log("✅ Redis подключен успешно"))
  .catch((err) => {
    console.error("❌ Ошибка при подключении к Redis:", err);
    process.exit(1);
  });

// === Команды ===
bot.command("start", async (ctx) => {
  const user = ctx.from;

  try {
    await supabase.from("users").upsert({
      telegram_id: user.id,
      username: user.username,
    });

    await redis.set(`user:${user.id}`, user.username);

    await ctx.reply(`Привет, ${user.first_name}! Я работаю через Webhook 🎯`);
  } catch (err) {
    console.error("Ошибка при выполнении команды /start:", err);
    await ctx.reply("Произошла ошибка при обработке команды. Попробуйте позже.");
  }
});

bot.command("whoami", async (ctx) => {
  try {
    const name = await redis.get(`user:${ctx.from.id}`);
    ctx.reply(`Ты: ${name}`);
  } catch (err) {
    console.error("Ошибка при выполнении команды /whoami:", err);
    await ctx.reply("Произошла ошибка при обработке команды. Попробуйте позже.");
  }
});

// === Создаём express-сервер для Webhook ===
const app = express();
app.use(express.json());
app.use("/webhook", webhookCallback(bot, "express"));

// === Запуск сервера на Render ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);

  const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/webhook`;

  try {
    await bot.api.setWebhook(webhookUrl);
    console.log(`🚀 Webhook установлен: ${webhookUrl}`);
  } catch (err) {
    console.error("❌ Ошибка при установке webhook:", err);
  }
});

