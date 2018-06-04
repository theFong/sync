const express = require('express');
const mongoose = require('mongoose');

// protect an endpoint
const path = require('path');
const auth = require('http-auth');
const basic = auth.basic({
    file: path.join(__dirname, '../users.htpasswd'),
  });

const router = express.Router();

const { body, validationResult } = require('express-validator/check');

const Registration = mongoose.model('Registration');
const Audio = mongoose.model('Audio');

// index route 
// get
router.get('/', (req, res) => {
    res.render('form', { title: 'Registration form' });
  });
// post
router.post('/',[
    body('name')
      .isLength({ min: 1 })
      .withMessage('Please enter a name'),
    body('email')
      .isLength({ min: 1 })
      .withMessage('Please enter an email'),
  ],(req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        const registration = new Registration(req.body);
        registration.save()
            .then(() => { res.send('Thank you for your registration!'); })
            .catch(() => { res.send('Sorry! Something went wrong.'); });
    } else {
        res.render('form', {
        title: 'Registration form',
        errors: errors.array(),
        data: req.body,
        });
    }
});

router.get('/registrations', auth.connect(basic), (req, res) => {
    Registration.find()
      .then((registrations) => {
        res.render('index', { title: 'Listing registrations', registrations });
      })
      .catch(() => { res.send('Sorry! Something went wrong.'); });
  });

router.get('/audio_test', auth.connect(basic), (req, res) => {
  res.render('audio', {audio_link: 'http://www.lukeduncan.me/oslo.mp3',
      title: 'Oslo',
      author: 'Holy Esque',
      cover_art_link: 'https://artwork-cdn.7static.com/static/img/sleeveart/00/051/614/0005161476_350.jpg'}) ;
});

module.exports = router;