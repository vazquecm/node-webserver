'use strict'

const express = require('express');
const app = express();
// bodyParser looks for a form
const bodyParser = require('body-parser');
//const upload = require('multer')({ dest: 'tmp/uploads' });
const multer = require('multer');
const imgur = require('imgur');
const MongoClient = require('mongodb').MongoClient;
// actuals request the web page and pulls down the info to be used
const request = require('request');
const _ = require('lodash');
// allows you to look at the "requested" data with jquery like selectors
const cheerio = require('cheerio');

const path = require('path');
const sassMiddleware = require('node-sass-middleware');
const PORT = process.env.PORT || 3000;
const MONGODB_URL = 'mongodb://localhost:27017/node-webserver';

let db;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// multer = is getting streams of files and then adding them together "multi posts" so you get small bits at a time instead of waiting for a huge file to load
let newFilename;
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'tmp/uploads')
  },
  filename: function (req, file, cb) {
    newFilename = file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[1];
    cb(null, newFilename)
    console.log(file);
  }
})


//view engine setup  app.set creates a variable that can be used in any file
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade');

//set up an express variable passed to every res.render..something you want on every rendered page
app.locals.title = 'SORRY, no calendar here.';

// middleware functions are put above all ROUTES
//app.use(bodyParser.urlencoded({ extended: false }));

///SASS set up
  app.use(sassMiddleware({
    /* Options */
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));

// express.static = I'm getting html, css files already made/not changing
app.use(express.static(path.join(__dirname, 'public')));


// ROUTE: root  //order does matter with routes //
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
// POST method
app.post('/contact', (req) => {
  const obj = {
    name: req.body.name,
    email: req.body.email,
    message: req.body.message
  };
/// this is getting info from the database and inserting it to the contact form
  db.collection('contact').insertOne(obj, (err, res) => {
    if (err) throw err;

  res.send('<h1>Thanks for contacting us ${obj.name}</h1>');
  });
});


app.get('/sendphoto', (req, res) => {
  res.render('sendphoto');
});

// uploading the new file to Imgur
  imgur.uploadFile('tmp/uploads/' + newFilename)
    .then(function (json, req) {
        console.log(json.data.link);
        console.log(req.file.filename);
    })
    .catch(function (err) {
      console.log('imgur error message');
        console.error(err.message);
 });

let upload = multer({ storage: storage })

// upload.single is using "multer"
app.post('/sendphoto', upload.single('image'), (req, res) => {
  // Uploading the new image to Imgur
  res.send('<h1>Thanks for sending us your photo.</h1>');
  console.log(newFilename);
});


app.post('/api', (req, res) => {
  const obj = _.mapValues(req.body, val => val.toUpperCase());

  db.collection('allcaps').insertOne(obj, (err, result) => {
    if (err) throw err;

    console.log(result.ops[0]);
    res.send(obj);
  });
});


// getting weather data
app.get('/api/weather', (req, res) => {
  const API_KEY = '00c2032f84f5e9393b7a1eda02d49228';
  const url = `https://api.forecast.io/forecast/${API_KEY}/37.8267,-122.423`;

  request.get(url, (err, response, body) => {
    if (err) throw err;

    res.header('Access-Control-Allow-Origin', '*');
    res.send(JSON.parse(body));
  });
});


// getting top news stories from cnn -- not using an "else" statement is allowing us to not write same code repeatedly
app.get('/api/news', (req, res) => {
  db.collection('news').findOne({}, (err, doc) => {
    if (doc) {
      const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
      const diff = new Date() - doc._id.getTimestamp() - FIFTEEN_MINUTES_IN_MS;
      const lessThan15MinutesAgo = diff > 0;

      if (lessThan15MinutesAgo) {
        res.send(doc);
        return;
      }
    }
      const url = 'http://cnn.com';

      request.get(url, (err, response, html) => {
        if (err) throw err;

        const news = [];
        ////converting html string into a cheerio obj - entire page turned into a giant jquery like object
        const $ = cheerio.load(html);
        //caching the selector VERY important in frontend, affects run time to all it multiply times as below instead put in variable
        const $bannerText = $('.banner-text');

        news.push({
          title: $bannerText.text(),
          url: url + $bannerText.closest('a').attr('href')
        });
        //cache array of DOM elements
        const $cdHeadline = $('.cd__headline');

        _.range(1, 12).forEach(i => {
          const $headline = $cdHeadline.eq(i);

          news.push({
            title: $headline.text(),
            url: url + $headline.find('a').attr('href')
          });
        });

        db.collection('news').insertOne({ top: news }, (err, res) => {
          if (err) throw err;
          //converting back again
          res.send(news);
        });
      });
    })
  })


// ROUTE: hello - getting a name to show
app.get('/hello', (req, res) => {
  const name = req.query.name;
  // the program will use the "if" statement if no name is being queried
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

// this would work if I had a calendar working...but I don't
app.get('/cal/:year/:month', (req,res) => {
  const month = require('node-cal/lib/month');
   console.log(month.setUpWholeMonth);
    res.send('<pre>' + month.setUpWholeMonth(req.params.year, req.params.month) + '</pre>');
});

//  ROUTE: random - generating a random number - use /random after port#
app.get('/random', (req, res) => {
  res.send(Math.random().toString());
});

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// Returns a random integer between min (included) and max (excluded)
 function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max-min)) + min;
}

// ROUTE: random number between two entered digits
app.get('/random/:min/:max', (req, res) => {
  const min = req.params.min;
  const max = req.params.max;
   console.log('PARAMS ', req.params);
    res.send(getRandomInt(+min, +max).toString());
 });

// gets all remaining options
app.get('/secret', (req, res) => {
  res
    .status(403)
    .send('Access Denied!');
});

MongoClient.connect(MONGODB_URL, (err, database) => {
  if (err) throw err;

  db = database;

/// example only of getting an object from within an array ///
  // db.collection('docs').insertMany([
  //   {a : 'b'}, {c : 'd'}, {e : 'f'}
  // ], (err, res) =>  {
  //   if (err) throw err;
  //   console.log(res);
  // });

  app.listen(PORT, () => {
    console.log('Node.js server started. Listening on port ${PORT}');
  })
})
