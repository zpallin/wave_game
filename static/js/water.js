////////////////////////////////////////////////////////////////////////////////
// water

function Water(pos) {
  this.pos = typeof pos !== 'undefined' ? pos: {x:0,y:0,w:2000,h:500};
  this.height = 0;
  this.waterAnim = new Animation(waterImg, 100, 100, 10, 'reverse', true, [0,1,2,3,4,5,6,7,8,9,10,11]);
}

Water.prototype.update = function(dt) {
  this.waterAnim.update(dt);
}

Water.prototype.setHeight = function(height) {
  this.height = height;
}

Water.prototype.render = function() {
  var idx = this.waterAnim.idx;
  var w = this.waterAnim.w;
  var h = this.waterAnim.h;
  for (var x = 0; x < this.pos.w; x += w) {
    this.waterAnim.idx--;
    if (this.waterAnim.idx < 0) {
      this.waterAnim.idx = this.waterAnim.seq.length-1;
    }

    for (var y = 0; y < this.height + 256; y += h) {
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.translate(x + this.pos.x, y + (this.pos.y + this.pos.h) - this.height)
      this.waterAnim.draw();
      ctx.restore();
    }
  }
  this.waterAnim.idx = idx;
}
