'use strict';

const app = require('express')();
const PORT = process.env.PORT || 3000;


// getting a name to show
app.get('/hello', (req, res) => {
 let name = req.query.name;
 // the program will use the "if" statement if no name is being
 // queried
 if (name ===undefined) {
   name = 'World'
 }
 const msg = `<h1>Hello ${name}!</h1>
              <h2>Goodbye ${name}!</h2>`;
 console.log('query params ', req.query);

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

// getting a random number - use /random after port#
app.get('/random', (req, res) => {
  res.send(Math.random().toString());
});


//order does matter with routes
//all = any verbs, * = everything
//app.all('*', (req, res) => {
  //res.writeHead(403);
  //res.end('Access Denied!');
//});

app.get('/secret', (req, res) => {
  res
    .status(403)
    .send('Access Denied!');
});

app.listen(PORT, () => {
  console.log(`Node.js server started. Listening on port ${PORT}`);
});

