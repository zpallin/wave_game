var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var keys = new Keys();

var coinImg = new Image();
var colorTest = new RenderColor(ctx, 40, 40, ['#00ff00', '#00dd00', '#00bb00']);
coinImg.src = '/img/coin.png';
var animTest = new RenderAnim(ctx, 44, 44, coinImg);

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
	x: 0,
	y: 0,
	w: 44,
	h: 44,
	left: false,
	down: false,
	right: false,
	up: false,
	update: function() {
		animTest.anim(this.x - (this.w / 2), this.y - (this.h / 2));
	},
  move: function() {
    if (this.left) {
      this.x -= 1;
    }
    if (this.right) {
      this.x += 1;
    }
    if (this.down) {
      this.y += 1;
    }
    if (this.up) {
      this.y -= 1;
    }
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
  helpers.clamp(player,world);
  player.move();
	player.update();
  ctx.restore();
}

function update() {
//	console.log(Player);
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
}

function run() {
  var now = null;
  var last = new Date().getTime();
  var dt = 0;
  var gdt = 0;
  reset();

  function frame() {
    now = new Date().getTime();
    dt = Math.min(1, (now - last) / 1000);

    update();
    render(dt);
    last = now;
    //window.setTimeout(frame, 1000 / 60);
    window.requestAnimationFrame(frame);
  }

  frame();
}

run();
