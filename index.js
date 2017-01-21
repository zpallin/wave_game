'use strict';

////////////////////////////////////////////////////////////////////////////////
// imports

const config = require('./config.json');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

////////////////////////////////////////////////////////////////////////////////
// config

app.set('view engine', 'pug');
app.use(express.static('static'));

////////////////////////////////////////////////////////////////////////////////
// server

app.get('/', function(req, res) {
  res.render('index', { title: 'Wave IO', message: 'hello'});
});

server.listen(config.port, function() {
  console.log("Listening on "+ config.port);
});

var players = [];

io.sockets.on('connection', function(socket) {
  socket.broadcast.emit('user connected');
  socket.on('playermovement', function(data) {
    for (var p in players) {
      var player = players[p];
      if (player.keycode === data.keycode) {
        players[p] = data;
        break;
      }
    }
    console.log('player update');
    players.push(data);
    // players = players.filter(function(n){ return n != undefined }); 
    socket.broadcast.emit('players', data);
  });
});
