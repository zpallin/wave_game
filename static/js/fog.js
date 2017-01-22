////////////////////////////////////////////////////////////////////////////////
// fog

function Fog(pos) {
  this.pos = typeof pos !== 'undefined' ? pos: {x:0,y:0,w:2000,h:500};
  this.alpha = 0;
}

Fog.prototype.setAlpha = function(alpha) {
  this.alpha = alpha * 0.5;
}

Fog.prototype.render = function() {
  ctx.save();
  // var pattern = ctx.createPattern(sandImg, 'repeat');
  // ctx.fillStyle = pattern;
  ctx.fillStyle = 'white';
  ctx.globalAlpha = this.alpha;
  ctx.fillRect(this.pos.x, this.pos.y, this.pos.w, this.pos.h);
  ctx.restore();
}
