// pages/api/bot.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    // чтобы GET/HEAD не давали 404 — возвращаем OK
    return res.status(200).send('OK');
  }
  try {
    const update = req.body;
    console.log('Telegram update:', JSON.stringify(update));
    // обработку выполняем асинхронно, возвращаем 200 немедленно
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('server error');
  }
}
