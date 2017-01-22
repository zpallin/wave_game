
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var entityList = {};
var socket = io.connect("/");

////////////////////////////////////////////////////////////////////////////////

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

function PLAYER(id, color, pos) {
  // config
	this.id = id;
  this.x = pos.x;
  this.y = pos.y;
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
  for (var p in entityList) {
    entityList[p].draw();
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
	socket.emit('player_move', {x: player.x, y: player.y});
}

function run() {
  var now = null;
  var last = new Date().getTime();
  var dt = 0;
  var gdt = 0;

	setKeyListener(KEYS);
  function frame() {
    now = new Date().getTime();
    dt = Math.min(1, (now - last) / 1000);
    gdt = gdt + dt;

    update();
    render();
    last = now;
    window.setTimeout(frame, 1000 / 60);
  }

  // new entity connected
  socket.on('entity_connected', function(entityData) {
    entity = new PLAYER(entityData.id, entityData.color, entityData.pos);
    entityList[entityData.id] = entity;
  });

  // existing entity left the game.
  socket.on('entity_disconnected', function(id) {
    delete entityList[id];
  });

  // Your identifier
  socket.on('set_identity', function(id) {
    player = entityList[id];

    // Now that we know who we are, let's start playing!
    frame();
  });

  // now get the data
  socket.on('entity_moved', function(entityData) {
    var entity = entityList[entityData.id];
    if (entity) {
      entity.x = entityData.pos.x;
      entity.y = entityData.pos.y;
    }
  });

  // Entity is hidden from view.
  socket.on('entity_hidden', function(id) {
    var entity = entityList[id];
    if (entity) {
      entity.x = -10000;
      entity.y = -10000;
    }
  });
}

run();
