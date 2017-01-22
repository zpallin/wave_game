////////////////////////////////////////////////////////////////////////////////
// camera

function Camera(ctx, canvas, entity) {
  this.ctx = ctx;
  this.canvas = canvas;
  this.entity = entity;
  this.pos = this.entity.pos;
  this.w = this.canvas.width;
  this.h = this.canvas.height;
  this.lerp = 8;
}
Camera.prototype.focus = function() {
  this.ctx.translate(
    -this.pos.x + this.w / 2,
    -this.pos.y + this.h / 2
  );
}
Camera.prototype.follow = function(dt) {
  dt = typeof dt === 'undefined' ? 0 : dt;
  // transform camera x, y toward entity x, y
  this.x += (this.entity.x - this.pos.x) * this.lerp * dt;
  this.y += (this.entity.y - this.pos.y) * this.lerp * dt;
}

////////////////////////////////////////////////////////////////////////////////
// render object for rendering stuff onto the canvas

function RenderColor(ctx, h, w, colors, tpf) {

  // assuming ctx is passed :/
  this.ctx = ctx;
  this.h = h;
  this.w = w;

  // iterator
  this.iter = 0; 
  this.tc = 0;

  // tpf setting
  this.tpf = 15;
  if (typeof tpf !== 'undefined') {
    this.tpf = tpf;
  }
 
  // colors must have length
  this.colors = colors;
 
  if (this.colors.length === 0) {
    this.colors = ["#ff0000"];
  }
}
// simple rectangle draw based on simple things
RenderColor.prototype.rectLoop = function(x, y) {

  x = typeof x === 'undefined' ? 0 : x;
  y = typeof y === 'undefined' ? 0 : y;

  // doing this first makes sure it always stays under the index
  this.iter = this.iter % this.colors.length;

  ctx.beginPath();
  ctx.fillStyle = this.colors[this.iter];
  ctx.rect(x,y,this.w,this.h);
  ctx.fill();
  ctx.closePath();
  this.tc++;

  // iterate colors if tick count passes ticks per frame
  if (this.tc >= this.tpf) {
    this.tc = 0;
    this.iter++;
  }
}

////////////////////////////////////////////////////////////////////////////////
// animation object

function Animation(ctx, img, fw, fh, fps, loop, seq) {
	this.ctx = ctx;
	this.img = img;
	this.seq = [];
	this.w = fw;
	this.h = fh;

  this.fullSeq = [];

  for (var i = 0; i < this.img.width; i+=fw) {
    this.fullSeq.push(i);
  }

  if (seq === 'reverse') {
    this.seq = this.fullSeq.reverse();

  } else if (typeof seq === 'undefined' || seq.length === 0) {
    this.seq = this.fullSeq;

	} else {
    for (var i = 0; i < seq.length; i++) {
      this.seq.push(this.fullSeq[seq[i]]);
    }
  }

	this.fps = typeof fps === 'undefined' ? 15 : fps;
	this.loop = typeof loop === 'undefined' ? true : loop;
}
Animation.prototype.reset = function() {
	this.dt = 0;
	this.idx = 0;
}
Animation.prototype.update = function(dt) {
	this.dt += dt;

	// the index should be incrementing by no more than the integer value of
	// dx multiplied by fps multiplied by this.w
	if (this.dt > 1 / this.fps) {
		this.idx++;
		this.dt = 0;
	}

	// if it's a loop, modulo the idx
	if (this.loop) {
		this.idx = this.idx % this.seq.length;
	// if it's not, figure out if the animation should return false
  	}	else if (this.idx > this.seq.length) {
		return false;
	}
	return true;
}

Animation.prototype.draw = function() {
  this.ctx.drawImage(this.img, this.seq[this.idx], 0, this.w, this.h, 0, 0, this.w, this.h);
}
