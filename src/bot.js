import "dotenv/config";
import { Bot } from "grammy";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";

// Проверка переменных окружения
if (!process.env.BOT_TOKEN || !process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || !process.env.UPSTASH_URL || !process.env.UPSTASH_TOKEN) {
  console.error("Ошибка: Не все необходимые переменные окружения заданы.");
  process.exit(1); // Завершаем процесс, если переменные окружения отсутствуют
}

const bot = new Bot(process.env.BOT_TOKEN);

// Логируем параметры подключения для отладки
console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Upstash URL:', process.env.UPSTASH_URL);

// Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Redis
const redis = new Redis({
  url: process.env.UPSTASH_URL,
  token: process.env.UPSTASH_TOKEN,
});

// Проверка подключения к Redis
redis.set("test_key", "test_value")
  .then(() => console.log("Redis подключен успешно"))
  .catch((err) => {
    console.error("Ошибка при подключении к Redis:", err);
    process.exit(1); // Завершаем процесс, если Redis не подключается
  });

// Команда /start
bot.command("start", async (ctx) => {
  const user = ctx.from;
  
  try {
    // Запись данных пользователя в Supabase
    await supabase.from("users").upsert({
      telegram_id: user.id,
      username: user.username,
    });

    // Запись данных пользователя в Redis
    await redis.set(`user:${user.id}`, user.username);

    await ctx.reply(`Привет, ${user.first_name}!`);
  } catch (err) {
    console.error("Ошибка при выполнении команды /start:", err);
    await ctx.reply("Произошла ошибка при обработке команды. Попробуйте позже.");
  }
});

bot.command('start', async (ctx) => {
  const menu = [
    [
      { text: 'Выход', callback_data: 'exit' },
      { text: 'Регистрация', callback_data: 'register' },
    ],
    [{ text: 'Знакомство с ботом', callback_data: 'info' }],
  ];

  await ctx.reply('Привет! Выберите действие:', {
    reply_markup: {
      inline_keyboard: menu,
    },
  });
});

bot.on('callback_query', async (ctx) => {
  const callbackData = ctx.callbackQuery.data;

  if (callbackData === 'exit') {
    await ctx.answerCallbackQuery();
    await ctx.reply('До новых встреч!');
  }

  if (callbackData === 'register') {
    await ctx.answerCallbackQuery();
    await ctx.reply('Введите ваше ФИО:');
    bot.on('message', async (msgCtx) => {
      const userName = msgCtx.text;
      await msgCtx.reply('Введите марку авто:');
      bot.on('message', async (msgCtx2) => {
        const carModel = msgCtx2.text;
        await msgCtx2.reply('Введите номер для связи:');
        bot.on('message', async (msgCtx3) => {
          const phoneNumber = msgCtx3.text;
          await msgCtx3.reply(`Вы зарегистрированы!\nФИО: ${userName}\nМарка авто: ${carModel}\nНомер: ${phoneNumber}`);
        });
      });
    });
  }

  if (callbackData === 'info') {
    await ctx.answerCallbackQuery();
    await ctx.reply('Посмотрите видеопрезентацию на следующем сайте: https://example.com');
  }
});

bot.start();