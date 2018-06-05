const express = require('express');
const routes = require('./routes/index');
const path = require('path');
const bodyParser = require('body-parser');

var app = express();

// hook up body parser
app.use(bodyParser.urlencoded({ extended: true }));

// hook up routes
app.use('/', routes);

// static files
app.use(express.static('public'));

// hook up views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// hook up socket.io
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
    socket.on('toggle', function(type){
        console.log('toggle: ' + type);
        io.emit('toggle', type);
      });
      socket.on('seek', function(percent){
        console.log('seek: ' + percent);
        io.emit('seek', percent);
      });
  });  


module.exports.app = http;