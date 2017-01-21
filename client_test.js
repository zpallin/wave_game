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
  res.render('client_test', { title: 'Wave IO', message: 'hello'});
});

server.listen(config.port, function() {
  console.log("Listening on "+ config.port);
});
