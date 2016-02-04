'use strict';



const express = require('express');
// bodyParser looks for a form
const bodyParser = require('body-parser');
const upload = require('multer')({ dest: 'tmp/uploads' });

const app = express();

const PORT = process.env.PORT || 3000;
const path = require('path');
const sassMiddleware = require('node-sass-middleware');

//SASS set up
  app.use(sassMiddleware({
    /* Options */
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));


// express.static = I'm getting html, css files already made/not changing
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'))

app.set('view engine', 'jade');

app.locals.title = 'SORRY, no calendar here.';



// middleware functions are put above all ROUTES
app.use(bodyParser.urlencoded({ extended: false }));


//order does matter with routes
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


// ROUTE: contact
app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/sendphoto', (req, res) => {
  res.render('sendphoto');
});


// upload.single is using "multer"
app.post('/sendphoto', upload.single('image'), (req, res) => {
  res.send('<h1>Thanks for sending us your photo.</h1>');
});


// POST method
app.post('/contact', (req, res) => {
  const name = req.body.name;
  res.send('<h1>Thanks for contacting us ${name}</h1>');
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



app.get('/secret', (req, res) => {
  res
    .status(403)
    .send('Access Denied!');
});


app.listen(PORT, () => {
  console.log(`Node.js server started. Listening on port ${PORT}`);
});

