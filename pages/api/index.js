import { VercelRequest, VercelResponse } from '@vercel/node';
import { bot } from '../bot.js'; // твой объект bot

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body, res);
  } else {
    res.status(200).send('Bot is running!');
  }
}
