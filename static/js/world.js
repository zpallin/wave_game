////////////////////////////////////////////////////////////////////////////////
// world

function World(pos) {
  this.pos = typeof pos !== 'undefined' ? pos: {x:0,y:0,w:2000,h:500};
}

World.prototype.render = function() {
  ctx.save();
  var pattern = ctx.createPattern(sandImg, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(this.pos.x, this.pos.y, this.pos.w, this.pos.h);
  ctx.restore();
}
