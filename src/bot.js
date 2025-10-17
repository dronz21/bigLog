import "dotenv/config";
import { Bot } from "grammy";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";

const bot = new Bot(process.env.BOT_TOKEN);

// Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Redis
const redis = new Redis({
  url: process.env.UPSTASH_URL,
  token: process.env.UPSTASH_TOKEN,
});

// Команда /start
bot.command("start", async (ctx) => {
  const user = ctx.from;
  await supabase.from("users").upsert({
    telegram_id: user.id,
    username: user.username,
  });
  await redis.set(`user:${user.id}`, user.username);
  await ctx.reply(`Привет, ${user.first_name}!`);
});

// Проверка
bot.command("whoami", async (ctx) => {
  const name = await redis.get(`user:${ctx.from.id}`);
  ctx.reply(`Ты: ${name}`);
});

// Запуск
bot.start();
console.log("Бот запущен ✅");
