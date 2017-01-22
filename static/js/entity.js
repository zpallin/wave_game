////////////////////////////////////////////////////////////////////////////////
// entity

function Entity(ctx, pos, anims) {
  this.ctx = ctx;
  this.pos = pos;
  this.scale
  this.bounds = bounds;
  this.anims = typeof anims === 'undefined' ? {} : anims;
  this.state = 'idle';
  this.colorLoop = ["#005500", "#006600", "#007700", "#006600"];
  this.defaultColor = new RenderColor(ctx, this.pos.h, this.pos.w, this.colorLoop);
}

Entity.prototype.setState = function(state) {
  this.state = typeof state === 'undefined' ? 'idle' : state;
}

Entity.prototype.reset = function() {
  for (var a in this.anims) {
    this.anims[a].reset();
  }
}

Entity.prototype.update = function(dt, x, y) {
  x = typeof x === 'undefined' ? this.pos.x : x;
  y = typeof y === 'undefined' ? this.pos.y : y;

  if (this.state in this.anims) {
    var status = this.anims[this.state].update(dt);

    if (true !== status) {
      this.setState(); // sets to idle
    }
  } else {
    this.defaultColor.rectLoop(x, y);
  }
} 

Entity.prototype.render = function() {
  console.log("drawing: " + this.state);
  var anim = this.anims[this.state];
  
  this.ctx.save();
  this.ctx.translate(this.pos.x - this.pos.w / 2, this.pos.y - this.pos.h / 2);
  this.ctx.scale(this.pos.w / anim.w, this.pos.h / anim.h);
  anim.draw();
  this.ctx.restore();
}
