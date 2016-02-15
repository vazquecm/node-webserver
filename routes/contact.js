'use strict';

const express = require('express');
const router = express.Router();


// const Contact = require('../models/contact');
const contact = require('../controllers/contact');

// this gets the first contact file - localhost:3000/contact - sets the url
router.get('/contact', contact.index);
// if there is new content going to continue the path in contact ??????
router.post('/contact', contact.new);

module.exports = router;
