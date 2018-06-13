const express = require('express');
const routes = require('./routes/index');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Content_session = mongoose.model('Content_session');

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


//refactor using redis and handle multiple
var active_content_session = {  num_users: 0,
                                player_state : { playing : false,
                                                 current_time :  0 }  };

//  KNOWN BUG THAT STATE LAGS WHEN NEW USER JOINS WHILE PLAYING

io.on('connection', function(socket){
    console.log('a user connected');
    console.log(active_content_session.player_state);
    active_content_session.num_users += 1;
    io.to(socket.id).emit('init', active_content_session.player_state)
    socket.on('disconnect', function(){
      console.log('user disconnected');
      active_content_session.num_users -= 1;
      if (active_content_session.num_users === 0) {
          save_player_state(active_content_session.player_state);
      }
    });
    socket.on('toggle', function(type){
        console.log('toggle: ' + type);
        if (type === 'play') {
            active_content_session.player_state.playing = true;
        } else {
            active_content_session.player_state.playing = false;
        }
        io.emit('toggle', type);
      });
    socket.on('seek', function(percent){
        // console.log('seek: ' + percent);
        active_content_session.player_state.current_time = percent;
        io.emit('seek', percent);
    });
    socket.on('current_percent', function(percent){
        console.log(active_content_session.player_state);
        if(percent !== active_content_session.player_state.current_time)
        {
            active_content_session.player_state.current_time = percent;
        }
    });
  });
  
function save_player_state(player_state) {
    console.log('saving session');
}


module.exports.app = http;