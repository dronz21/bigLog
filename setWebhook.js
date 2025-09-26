import bot from './src/bot.js';

async function setWebhook() {
  try {
    await bot.api.setWebhook('https://biglog.vercel.app/api');
    console.log('Webhook установлен!');
  } catch (err) {
    console.error('Ошибка при установке webhook:', err);
  }
}

setWebhook();
