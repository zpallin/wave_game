////////////////////////////////////////////////////////////////////////////////
// fog

function Fog(pos) {
  this.pos = typeof pos !== 'undefined' ? pos: {x:0,y:0,w:2000,h:500};
  this.alpha = 0;
  this.fogAnim = new Animation(fogImg, 100, 100, 10, false, true, [0,1,2,3,4,5,6,7,8,9,10,11]);
}

Fog.prototype.update = function(dt) {
  this.fogAnim.update(dt);
}

Fog.prototype.setAlpha = function(alpha) {
  this.alpha = alpha * 0.5;
}

Fog.prototype.render = function() {
  var idx = this.fogAnim.idx;
  var w = this.fogAnim.w;
  var h = this.fogAnim.h;
  for (var x = 0; x < this.pos.w; x += w) {
    this.fogAnim.idx += 3;
    this.fogAnim.idx %= this.fogAnim.seq.length;

    for (var y = 0; y < this.pos.h; y += h) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(x, y);
      this.fogAnim.draw();
      ctx.restore();
    }
  }
  this.fogAnim.idx = idx;
}
