import express from 'express';
import { Bot, webhookCallback } from 'grammy';

const bot = new Bot(process.env.BOT_TOKEN);  // Токен твоего бота

const app = express();

// Обрабатываем запросы от Telegram на /webhook
app.use(express.json());
app.use('/webhook', webhookCallback(bot, 'express'));

// Устанавливаем Webhook
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  
  const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/webhook`; // URL для Webhook

  try {
    await bot.api.setWebhook(webhookUrl);  // Настройка Webhook
    console.log(`🚀 Webhook успешно установлен: ${webhookUrl}`);
  } catch (err) {
    console.error('❌ Ошибка при установке webhook:', err);
  }
});
import express from 'express';
import { Bot, webhookCallback } from 'grammy';

const bot = new Bot(process.env.BOT_TOKEN);  // Токен твоего бота

const app = express();

// Обрабатываем запросы от Telegram на /webhook
app.use(express.json());
app.use('/webhook', webhookCallback(bot, 'express'));

// Устанавливаем Webhook
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  
  const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/webhook`; // URL для Webhook

  try {
    await bot.api.setWebhook(webhookUrl);  // Настройка Webhook
    console.log(`🚀 Webhook успешно установлен: ${webhookUrl}`);
  } catch (err) {
    console.error('❌ Ошибка при установке webhook:', err);
  }
});
