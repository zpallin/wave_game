
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var players = [];
var socket = io.connect("/");

////////////////////////////////////////////////////////////////////////////////

var config = {
  "players": "0",
  "player": {
    "colors": [
      "#00ff00",
      "#ff0000",
      "#0000ff",
      "#0ff000",
      "#000ff0",
      "#f0000f",
      "#ff0ff0",
      "#0ff0ff",
    ],
    "startX": [
      0 + 40,
      canvas.width - 40,
    ],
    "default": {
      "width": 40,
      "height": 80,
    },
  }
};
////////////////////////////////////////////////////////////////////////////////

var player = null;

var CONTROL = {
  left: false,
  right: false,
  up: false,
  down: false,
};

var KEY = {
  A: 65,
  D: 68,
  S: 83,
  W: 87,
};

var KEYS = [
    { keys: [KEY.A], mode: 'down', action: function() { CONTROL.left  = true;  } },
    { keys: [KEY.D], mode: 'down', action: function() { CONTROL.right = true;  } },
    { keys: [KEY.W], mode: 'down', action: function() { CONTROL.up    = true;  } },
    { keys: [KEY.S], mode: 'down', action: function() { CONTROL.down  = true;  } },
    { keys: [KEY.A], mode: 'up',   action: function() { CONTROL.left  = false; } },
    { keys: [KEY.D], mode: 'up',   action: function() { CONTROL.right = false; } },
    { keys: [KEY.W], mode: 'up',   action: function() { CONTROL.up    = false; } },
    { keys: [KEY.S], mode: 'up',   action: function() { CONTROL.down  = false; } },
];

////////////////////////////////////////////////////////////////////////////////

function PLAYER(keycode, color) {
  // config
	this.keycode = keycode;
  this.x = 0;
  this.y = 0;
  this.color = color;

  // static values
  this.w = 40;
  this.h = 80;
}
PLAYER.prototype.draw = function() {
	drawPlayer(this.x, this.y, this.w, this.h, this.color);
}
PLAYER.prototype.goto = function(x,y) {
  this.x = x;
  this.y = y;
}
PLAYER.prototype.move = function(x,y) {
  this.x += typeof x === 'undefined' ? 0 : x;
  this.y += typeof y === 'undefined' ? 0 : y;
}
PLAYER.prototype.data = function() {
	return {
		keycode: this.keycode,
		x: this.x,
		y: this.y,
		w: this.w,
		h: this.h,
		color: this.color,
	};
}

function drawPlayer(x,y,w,h,c) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fillStyle = c;
  ctx.fill();
  ctx.closePath();  
}

function renderBackground() {
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
}

function renderPlayers() {
  for (var p in players) {
    players[p].draw();
  } 
}

function renderPlayer() {
  player.draw();
}

function render() {
  renderBackground();
  renderPlayer();
  renderPlayers();
}

function randomKeyCode() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < 5; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

function reset() {
  players = [];
  for (var i = 0; i < config.players; i++) {
    players[i] = new PLAYER(randomKeyCode(), config.player.colors[i+1]);
    players[i].goto(canvas.width / 2, canvas.height * 0.8);
  }
  player = new PLAYER(randomKeyCode(), config.player.colors[0]);
}

function setKeyListener(keys) {
  var onkey = function(keyCode, mode) {
    var n, k;
    for(n = 0 ; n < keys.length ; n++) {
      k = keys[n];
      k.mode = k.mode || 'up';
      if ((k.key == keyCode) || (k.keys && (k.keys.indexOf(keyCode) >= 0))) {
        if (k.mode == mode) {
          k.action.call();
        }
      }
    }
  };

  document.addEventListener('keydown', function(ev) { onkey(ev.keyCode, 'down'); }, false);
  document.addEventListener('keyup', function(ev) { onkey(ev.keyCode, 'up'); }, false);
}

function update() {
  var x = 0;
  var y = 0;  

  if (CONTROL.up) {
    y -= 1;
  }
  if (CONTROL.down) {
    y += 1;
  }
  if (CONTROL.left) {
    x -= 1;
  }
  if (CONTROL.right) {
    x += 1;
  }
  
  player.move(x,y);
	socket.emit('playermovement', player.data());

	// now get the data
	socket.on('players', function(data) {
/*
		for (var i = 0; i < data.players.length; i++) {
			var other = data.players[i];
			console.log(JSON.stringify(other));
			if (other.keycode === player.keycode) {
				continue;
			}
			var color = config.player.colors[i % config.player.colors.length];
			drawPlayer(other.x, other.y, other.w, other.h, other.color);
		}
*/
		console.log("players");
	});
}

function run() {
  var now = null;
  var last = new Date().getTime();
  var dt = 0;
  var gdt = 0;

	setKeyListener(KEYS);
  reset();
  function frame() {
    now = new Date().getTime();
    dt = Math.min(1, (now - last) / 1000);
    gdt = gdt + dt;

    update();
    render();
    last = now;
    window.setTimeout(frame, 1000 / 60);
  }

  frame();
}

run();
