const API_URL = 'https://biglog-lx0z.onrender.com/api';

fetch(`${API_URL}/some-endpoint`)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error:', error));