'use strict'


const express = require('express');
const app = express();

// bodyParser looks for a form data - middleware for the POST
const bodyParser = require('body-parser');

// mongodb provides validation in the input - fields provides object mapping
const mongoose = require('mongoose');

// looking for the routes folder
const routes = require('./routes/');
// const api = require('./routes/api');

const path = require('path');

// an object containing a user environment - setting up evnvironment port and then using default
const PORT = process.env.PORT || 3000;

const MONGODB_HOST = process.env.MONGODB_HOST || 'localhost';
const MONGODB_PORT = process.env.MONGODB_PORT || 27017;
const MONGODB_USER = process.env.MONGODB_USER || '';
const MONGODB_PASS = process.env.MONGODB_PASS || '';
const MONGODB_NAME = process.env.MONGODB_NAME || 'node-webserver';

const MONGODB_AUTH = MONGODB_USER
  ? `${MONGODB_USER}:${MONGODB_PASS}@`
  : '';

const MONGODB_URL = `mongodb://${MONGODB_AUTH}${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_NAME}`

const sassMiddleware = require('node-sass-middleware');
// to compile jade
app.set('view engine', 'jade');

app.locals.title = 'SORRY, no calendar here.';

// using the user encoded data - returns middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// this can direct the page where to find the data needed
app.use(routes);

// connecting the url above here
mongoose.connect(MONGODB_URL);

// mongoose listens on an open connection
mongoose.connection.on('open', (err) => {
  if (err) throw err;
  app.listen(PORT, () => {
    console.log(`Node.js server started. Listening on port ${PORT}`);
  });
});

module.exports = app;


//view engine setup  app.set creates a variable that can be used in any file
// app.set('views', path.join(__dirname, 'views'))

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



/// EXAMPLE OF GETTING AN OBJECT FROM WITHIN AN ARRAY ////
  // db.collection('docs').insertMany([
  //   {a : 'b'}, {c : 'd'}, {e : 'f'}
  // ], (err, res) =>  {
  //   if (err) throw err;
  //   console.log(res);
  // });
