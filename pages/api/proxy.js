export default async function handler(req, res) {
  const response = await fetch('https://biglog-lx0z.onrender.com/api/some-endpoint');
  const data = await response.json();
  res.status(200).json(data);
}