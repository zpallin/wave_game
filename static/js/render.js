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

function RenderAnim(ctx, w, h, img, tpf, a) {
  this.ctx = ctx;
  this.w = w;
  this.h = h;

  // iterator
  this.tc = 0;
  this.iter = 0;

  // tpf
  this.tpf = 15;
  if (typeof tpf !== 'undefined') {
    this.tpf = tpf;
  }

  this.img = img;

  this.numFrames = this.img.width / this.w;
}
// animate an image
RenderAnim.prototype.anim = function(x, y) {
  
  this.iter = this.iter % this.img.width;

  ctx.beginPath();
  ctx.drawImage(this.img, this.iter, 0, this.w, this.h, x, y, this.w, this.h);
  ctx.closePath();
  this.tc++;

  // iterate colors if tick count passes ticks per frame
  if (this.tc >= this.tpf) {
    this.tc = 0;
    this.iter = (this.iter + this.w) % this.img.width;
  }
}
