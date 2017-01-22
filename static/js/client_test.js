var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var keys = new Keys();

var coinImg = new Image();
var colorTest = new RenderColor(ctx, 40, 40, ['#00ff00', '#00dd00', '#00bb00']);
coinImg.src = '/img/coin.png';
var animTest = new Animation(ctx, coinImg, 44, 44, 15, false);

// world
var world = {
  x: 0,
  y: 0,
	w: 1000,
	h: 1000,
  color: null, 
  update: function() {
    this.color.rectLoop();
  }
};
world.color = new RenderColor(ctx, world.w, world.h, ['#0000ff', '#0000dd', '#0000bb']);

var player = {
  pos: {x: 0, y: 0, w: 100, h: 100},
  speed: 4,
	left: false,
	down: false,
	right: false,
	up: false,
  entity: null, 
	update: function(dt) {
    this.move();
    this.entity.update(dt);
	},
  render: function() {
    this.entity.render();
  },
  generate: function() {
    var anims = {
      'idle': new Animation(ctx, coinImg, 44, 44),
      'left': new Animation(ctx, coinImg, 44, 44, 15, true, [0,1]),
      'right': new Animation(ctx, coinImg, 44, 44, 15, true, [2,3]),
      'up': new Animation(ctx, coinImg, 44, 44, 15, true, 'reverse'),
    }
    this.entity = new Entity(ctx, this.pos, anims);
  },
  reset: function() {
    this.entity.reset();
  },
  move: function() {
    var newState = undefined;
    if (this.left) {
      this.pos.x -= this.speed;
      newState = 'left';
    }
    if (this.right) {
      this.pos.x += this.speed;
      newState = 'right';
    }
    if (this.down) {
      this.pos.y += this.speed;
    }
    if (this.up) {
      this.pos.y -= this.speed;
      newState = 'up';
    }
    this.entity.setState(newState);
  }
};
var camera = new Camera(ctx, canvas, player);

function render(dt) {
	ctx.save();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  camera.focus();
	camera.follow(dt);
  world.update();
  colorTest.rectLoop(0, 0); 
	player.render();
  ctx.restore();
}

function update(dt) {
  player.update(dt);
  helpers.clamp(player.pos,world);
}

function reset() {
	keys.register({ keys: [KEY.A], mode: 'down', action: function() { player.left  = true;  } });
	keys.register({ keys: [KEY.D], mode: 'down', action: function() { player.right = true;  } });
	keys.register({ keys: [KEY.W], mode: 'down', action: function() { player.up    = true;  } });
	keys.register({ keys: [KEY.S], mode: 'down', action: function() { player.down  = true;  } });
	keys.register({ keys: [KEY.A], mode: 'up',   action: function() { player.left  = false; } });
	keys.register({ keys: [KEY.D], mode: 'up',   action: function() { player.right = false; } });
	keys.register({ keys: [KEY.W], mode: 'up',   action: function() { player.up    = false; } });
	keys.register({ keys: [KEY.S], mode: 'up',   action: function() { player.down  = false; } });
	keys.setListeners();
  player.reset();
}

function run() {
  var now = null;
  var last = new Date().getTime();
  var dt = 0;
  var gdt = 0;
  player.generate();
  reset();

  function frame() {
    now = new Date().getTime();
    dt = Math.min(1, (now - last) / 1000);

    update(dt);
    render(dt);
    last = now;
    //window.setTimeout(frame, 1000 / 60);
    window.requestAnimationFrame(frame);
  }

  frame();
}

run();
