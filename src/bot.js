import express from 'express';
import { Bot, webhookCallback } from 'grammy';

const bot = new Bot(process.env.BOT_TOKEN);

// === Пример простой команды ===
bot.command('start', async (ctx) => {
  await ctx.reply('Привет! Я работаю через Webhook 🎯');
});

// === Создаём express-сервер ===
const app = express();

// Обрабатываем обновления Telegram через /webhook
app.use(express.json());
app.use('/webhook', webhookCallback(bot, 'express'));

// === Запускаем сервер на Render ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);

  const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/webhook`;

  try {
    await bot.api.setWebhook(webhookUrl);
    console.log(`🚀 Webhook установлен: ${webhookUrl}`);
  } catch (err) {
    console.error('❌ Ошибка при установке webhook:', err);
  }
});
