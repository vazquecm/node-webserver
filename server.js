'use strict';

const app = require('express')();
const PORT = process.env.PORT || 3000;

app.get('/hello', (req, res) => {
 const msg = `<h1>Hello World!</h1>
<h2>Goodbye World!</h2>`;

  res.writeHead(200, {
    'Content-Type': 'text/html'
  });

  // chunk response by character
  msg.split('').forEach((char, i) => {
    setTimeout(() => {
      res.write(char);
    }, 1000 * i);
  });

  // wait for all characters to be sent
  setTimeout(() => {
    res.end();
  }, msg.length * 1000 + 2000);
});

app.get('/random', (req, res) => {
  res.end(Math.random().toString());
});

app.all('*', (req, res) => {
  res.writeHead(403);
  res.end('Access Denied!');
});

app.listen(PORT, () => {
  console.log(`Node.js server started. Listening on port ${PORT}`);
});

