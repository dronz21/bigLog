import 'dotenv/config';
import express from "express";
import { Bot, webhookCallback } from "grammy";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";

// Проверка обязательных переменных окружения
if (!process.env.BOT_TOKEN || !process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || !process.env.UPSTASH_URL || !process.env.UPSTASH_TOKEN) {
  console.error("❌ Недостающие обязательные переменные окружения.");
  process.exit(1);
}

const bot = new Bot(process.env.BOT_TOKEN);
console.log("🤖 BOT_TOKEN:", process.env.BOT_TOKEN ? "загружен ✅" : "не найден ❌");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const redis = new Redis({
  url: process.env.UPSTASH_URL,
  token: process.env.UPSTASH_TOKEN,
});

redis.set("test_key", "test_value")
  .then(() => console.log("✅ Redis подключен успешно"))
  .catch(err => {
    console.error("❌ Ошибка при подключении к Redis:", err);
    process.exit(1);
  });

// Создаем сервер для webhook
const app = express();
app.use(express.json());
app.use("/webhook", webhookCallback(bot, "express"));

const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);

  // Получаем статус вебхука
  const webhookStatus = await bot.api.getWebhookInfo();

  if (isProduction) {
    // Если на продакшн-среде вебхук не настроен, настраиваем его
    if (!webhookStatus.url) {
      const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/webhook`;
      try {
        await bot.api.setWebhook(webhookUrl);  // Устанавливаем webhook для продакшн-сервера
        console.log(`🚀 Webhook установлен: ${webhookUrl}`);
      } catch (err) {
        console.error("❌ Ошибка при установке webhook:", err);
      }
    } else {
      console.log("✅ Webhook уже настроен. Polling не используется.");
    }
  } else {
    // Для локальной разработки, если вебхук не настроен, используем polling
    if (!webhookStatus.url) {
      console.log("🔄 Вебхук не настроен. Запускаем polling для локальной разработки...");
      await bot.start(); // Запускаем polling
    } else {
      console.log("✅ Webhook уже настроен, polling не используется.");
    }
  }
});
