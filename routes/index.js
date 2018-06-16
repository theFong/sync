const express = require('express');
const mongoose = require('mongoose');

// protect an endpoint
const path = require('path');
const auth = require('http-auth');
const basic = auth.basic({
    file: path.join(__dirname, '../users.htpasswd'),
 });

 const url = require('url'); 

const router = express.Router();

const { body, validationResult } = require('express-validator/check');
var Multer  = require('multer')
var upload = Multer({ storage: Multer.memoryStorage()});

const Registration = mongoose.model('Registration');
const Audio = mongoose.model('Audio');
const User = mongoose.model('User');
const Content_session = mongoose.model('Content_session');

var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var sync_bucket_name = 'sync-content-bucket'
var region = 's3-us-west-1'
var crypto = require('crypto')

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
  Content_session.findById(req.query.session)
    .then((content_session) => {
      Audio.findById(content_session.audio)
      .then((audio) => {
        audio.session_name = content_session.name
        res.render('audio', audio);
      })
      .catch(() => { console.log('Sorry! Something went wrong.'); });
    })
    .catch(() => { console.log('Sorry! Something went wrong.'); });
  // res.render('audio', {audio_link: 'http://www.lukeduncan.me/oslo.mp3',
  //     title: 'Oslo',
  //     author: 'Holy Esque',
  //     cover_art_link: 'https://artwork-cdn.7static.com/static/img/sleeveart/00/051/614/0005161476_350.jpg'}) ;
});

router.get('/create_session_test', auth.connect(basic), (req, res) => {
  res.render('create_session', { });
});

router.post('/create_session_test', 
  upload.single('file'),
  (req, res) => {
  // if file
  console.log(req.body);
  if (req.file) {
    // upload to s3
    var id = crypto.randomBytes(12).toString('hex');
    params = {Bucket: sync_bucket_name, Key: id+'.mp3', Body: req.file.buffer };
    s3.putObject(params, function(err, data) {
      // if failure
      if (err) {
        console.log(err)
        res.render('create_session', {
          errors: [{'msg':'Error on upload'}],
          data: req.body
          });
      // if failure
      } else {
        // create audio model
        const audio = new Audio({ title: req.body.title ? req.body.title : req.file.originalname,
                                  artist: req.body.artist ? req.body.artist : '',
                                  audio_link: 'https://'+region+'.amazonaws.com/'+sync_bucket_name+'/'+id+'.mp3',
                                  cover_art_link: null });
        audio.save()
        // success
        .then((audio)  => { 
          // create contentession with audio
          const content_session = new Content_session({ name: req.body.name,
                                                        current_time: 0,
                                                        users: [],
                                                        audio: audio.id });
          content_session.save()
          // redirect to session link
          .then((cs)  => { res.redirect(url.format({
                                        pathname:"/audio_test",
                                        query: {
                                          session : cs.id
                                        }
                                      }));
          })
          .catch((err) => { 
            console.log(err)
            res.render('create_session', {
                        errors: [{'msg':'Error on upload'}],
                        data: req.body
                        }); });
          })
        // failure
        .catch((err) => { 
          console.log(err)
          res.render('create_session', {
                      errors: [{'msg':'Error on upload'}],
                      data: req.body
                      }); });
        
        console.log("Successfully uploaded data to myBucket/myKey");
      }
    });
  } else {
      res.render('create_session', {
      errors: [{'msg':'Please upload a file'}],
      data: req.body,
      });
  }
});

module.exports = router;