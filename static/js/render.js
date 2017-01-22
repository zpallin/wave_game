////////////////////////////////////////////////////////////////////////////////
// camera

function Camera(entity) {
  this.w = canvas.width;
  this.h = canvas.height;
  this.lerp = 8;
  this.setEntity(entity);
}
Camera.prototype.setEntity = function(entity) {
  this.entity = entity;
  this.pos = this.entity.pos;
}
Camera.prototype.focus = function() {
  ctx.translate(
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

function AnimationColor(colors, pos) {
  this.pos = typeof pos === 'undefined' ? {x:0,y:0,w:50,h:50} : pos;

  // iterator
  this.iter = 0; 
  this.tc = 0;
  this.w = this.pos.w;
  this.h = this.pos.h;

  // tpf setting
  this.tpf = 15;
  if (typeof tpf !== 'undefined') {
    this.tpf = tpf;
  }
 
  // colors must have length
  this.colors = colors;
 
  if (this.colors.length === 0) {
    this.colors = ["#ff0000","#ee0000","#dd0000","#ee0000"];
  }

  this.reset();
}

AnimationColor.prototype.update = function(dt) {
 
  // doing this first makes sure it always stays under the index
  this.iter = this.iter % this.colors.length;
  this.tc++;

  // iterate colors if tick count passes ticks per frame
  if (this.tc >= this.tpf) {
    this.tc = 0;
    this.iter++;
  }
}

AnimationColor.prototype.reset = function() {
  this.tx = 0;
  this.iter = 0;
}

AnimationColor.prototype.draw = function() {
  ctx.fillStyle = this.colors[this.iter];
  ctx.rect(this.pos.x,this.pos.y,this.pos.w, this.pos.h);
  ctx.fill();
}

////////////////////////////////////////////////////////////////////////////////
// animation object

function Animation(img, fw, fh, fps, loop, seq) {
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
  this.reset();
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
  ctx.drawImage(this.img, this.seq[this.idx], 0, this.w, this.h, 0, 0, this.w, this.h);
}
