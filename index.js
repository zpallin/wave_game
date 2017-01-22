'use strict';

////////////////////////////////////////////////////////////////////////////////
// imports

const config = require('./config.json');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const PlayerEntity = require('./server/entity/entity_player').PlayerEntity;
let entityMap = require('./server/entity/entity_base').entityMap;
const World = require('./server/world').World;
const worldSize = require('./server/world').worldSize;

let worldList = [];

////////////////////////////////////////////////////////////////////////////////
// config

app.set('view engine', 'pug');
app.use(express.static('static'));

// For now, create just one world.
worldList.push(new World(io));

////////////////////////////////////////////////////////////////////////////////
// server

app.get('/', function(req, res) {
  res.render('index', { title: 'Hermit Carnage', worldSize: worldSize});
});

app.get('/client_test', function(req, res) {
  res.render('client_test', { title: 'Wave IO', message: 'hello'});
});

server.listen(config.port, function() {
  console.log("Listening on "+ config.port);
});

io.sockets.on('connection', function(socket) {
  // Generate a new player entity and add them into a world
  let world = worldList[0]; // For now, just pick the first world only.

  new PlayerEntity(world, socket);
  socket.on('player_attack_zone', function(data) {
    console.log(data);
  });

});


