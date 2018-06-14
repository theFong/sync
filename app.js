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

var redis = require("redis"),
    client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

//refactor using redis and handle multiple
// var active_content_session = {  num_users: 0,
//                                 player_state : { playing : false,
//                                                  current_time :  0 }  };

var players = { "test_id" : { } };


// client.hget("test_id",'playing',function (err, replies) {
//         console.log(replies)
// });
// client.hset("test_id", "playing", true, redis.print)
// client.hmset("test_id", ["num_users", 0, "playing", false, "current_time", 0], redis.print);

client.hgetall("test_id", function (error, res) {
    if (!res) {
        client.hmset("test_id", ["num_users", 0, "playing", false, "current_time", 0], redis.print);
        players['test_id'] = { num_users : 0,
            playing   : false,
            current_time : 0 };
    } else {
        client.hset("test_id", "num_users", 0, function (error, set) {
            players['test_id'] = res;
        });   
    }
} );

// redis data structure:
// redis_data = { "session_id0" : { num_users : 0,
//                   playing   : false,
//                   current_time : 0 }, 
//                 "session_id1" : { num_users : 0,
//                     playing   : false,
//                     current_time : 0 }
//                 };

//  KNOWN BUG THAT STATE LAGS WHEN NEW USER JOINS WHILE PLAYING *WANT TO FIX*

io.on('connection', function(socket){
    console.log('a user connected');
    client.hincrby("test_id","num_users", 1);
    players['test_id'].num_users += 1;
    io.to(socket.id).emit('init', players['test_id']);
    socket.on('disconnect', function(){
      console.log('user disconnected');
      players['test_id'].num_users -= 1;
      client.hincrby("test_id","num_users", -1)
    });
    socket.on('toggle', function(type){
        console.log('toggle: ' + type);
        if (type === 'play') {
            players['test_id'].playing = true;
            client.hset("test_id", "playing", true, );
        } else {
            client.hset("test_id", "playing", false);
            players['test_id'].playing = false;
        }
        io.emit('toggle', type);
      });
    socket.on('seek', function(percent){
        players['test_id'].current_time = percent;
        client.hset("test_id", "current_time", percent);
        io.emit('seek', percent);
    });
    socket.on('current_percent', function(percent){
        players['test_id'].current_time = percent;
        client.hset("test_id", "current_time", percent);
    });
  });
  
function save_player_state(player_state) {
    console.log('saving session');
}


module.exports.app = http;