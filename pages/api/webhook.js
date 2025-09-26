// api/webhook.js — CommonJS версия
const bot = require('../../src/bot'); // импорт твоего бота

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 200;
    res.end('OK');
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  await new Promise(resolve => req.on('end', resolve));

  try {
    const update = JSON.parse(body);
    await bot.handleUpdate(update);
  } catch (err) {
    console.error('Ошибка в webhook:', err);
  }

  res.statusCode = 200;
  res.end('OK');
};
    // Если вы задали SECRET_TOKEN при setWebhook, проверяем заголовок:
    const secretToken = process.env.SECRET_TOKEN;
    if (secretToken) {
      const header = req.headers['x-telegram-bot-api-secret-token'];
      if (header !== secretToken) {
        res.statusCode = 401;
        res.end('Unauthorized');
        console.warn('Webhook: неверный secret token');
        return;
      }
    }

    // Читаем тело запроса (stream)
    let body = '';
    req.on('data', chunk => (body += chunk));
    await new Promise(resolve => req.on('end', resolve));

    if (!body) {
      // пустой body — ничего делать не надо
      res.statusCode = 200;
      res.end('OK');
      return;
    }

    let update;
    try {
      update = JSON.parse(body);
    } catch (err) {
      console.error('Webhook: JSON parse error', err);
      res.statusCode = 400;
      res.end('Bad Request');
      return;
    }

    // Передаём update в grammY
    await bot.handleUpdate(update);

    // Отвечаем Telegram, что всё ок
    try {
  res.statusCode = 200;
  res.end('OK');
} catch (err) {
  console.error('Webhook handler error:', err);
}
    // Если возвращать 500, Telegram будет повторять попытки — иногда полезно для критических ошибок.
    res.statusCode = 500;
    res.end('Error');
