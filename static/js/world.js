////////////////////////////////////////////////////////////////////////////////
// world

function World(pos) {
  this.pos = typeof pos !== 'undefined' ? pos: {x:0,y:0,w:2000,h:500};
  this.entity = new Entity(this.pos, {
    'idle': new AnimationColor( ['#0000ff', '#0000dd', '#0000bb'], this.pos),
  });
  this.visible = true;
}

World.prototype.update = function(dt) {
  this.entity.update(dt);
}

World.prototype.render = function() {
//  this.entity.render("world"); 
  ctx.beginPath();
  ctx.fillStyle = "blue";
  ctx.rect(0, 0, 2000, 500);
  ctx.fill();
  ctx.closePath();
}
