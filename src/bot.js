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

// Команда /whoami
bot.command("whoami", async (ctx) => {
  try {
    const name = await redis.get(`user:${ctx.from.id}`);
    ctx.reply(`Ты: ${name}`);
  } catch (err) {
    console.error("Ошибка при выполнении команды /whoami:", err);
    await ctx.reply("Произошла ошибка при обработке команды. Попробуйте позже.");
  }
});

// Запуск бота
bot.start().then(() => {
  console.log("Бот запущен ✅");
}).catch((err) => {
  console.error("Ошибка при запуске бота:", err);
});