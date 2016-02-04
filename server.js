'use strict';



const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

// express.static = I'm getting html, css files already made/not changing
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'jade');

// ROUTE: root
app.get('/', (req, res) => {
  // using a timeout waits for calling a database ...
  setTimeout(() => {
    res.render('index', {
     title: 'You will need to click the image below!!!',
     date: new Date()
  });
}, 2000);
});

// ROUTE: hello - getting a name to show
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

// response header
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

// getting a random number from a min# to a max#, put the numbers
// in the browser line and then you hit refresh and more random
// numbers are shown
// ROUTE: random
app.get('/random/:min/:max', (req, res) => {
  const min = req.params.min;
  const max = req.params.max;
  console.log('PARAMS ', req.params);

  res.send(getRandomInt(+min, +max).toString());
  });

  // ROUTE: random with route params
  function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max-min)) + min;
}


app.get('/cal/:year/:month', (req,res) => {
  const month = require('node-cal/lib/month');
  console.log(month.setUpWholeMonth);
  res.send('<pre>' + month.setUpWholeMonth(req.params.year, req.params.month) + '</pre>');

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

