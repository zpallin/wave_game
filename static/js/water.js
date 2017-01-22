////////////////////////////////////////////////////////////////////////////////
// water

function Water(pos) {
  this.pos = typeof pos !== 'undefined' ? pos: {x:0,y:0,w:2000,h:500};
  this.height = 0;
}

Water.prototype.setHeight = function(height) {
  this.height = height;
}

Water.prototype.render = function() {
  ctx.save();
  // var pattern = ctx.createPattern(sandImg, 'repeat');
  // ctx.fillStyle = pattern;
  ctx.fillStyle = 'blue';
  ctx.globalAlpha = 0.8;
  ctx.fillRect(this.pos.x, (this.pos.y + this.pos.h) - this.height, this.pos.w, this.height + 100);
  ctx.restore();
}
