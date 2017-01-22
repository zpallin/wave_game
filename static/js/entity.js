////////////////////////////////////////////////////////////////////////////////
// entity

function Entity(pos, anims) {
  this.pos = typeof pos === 'undefined' ? {x:0,y:0,w:50,h:50} : pos;
  this.anims = typeof anims === 'undefined' ? {} : anims;
  this.state = 'idle';
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
  }
} 

Entity.prototype.render = function() {
  if (!(this.state in this.anims)) {
    return false;
  }
  var anim = this.anims[this.state];
  
  ctx.save();
  ctx.translate(this.pos.x - this.pos.w / 2, this.pos.y - this.pos.h / 2);
  ctx.scale(this.pos.w / anim.w, this.pos.h / anim.h);
  anim.draw();
  ctx.restore();
}


////////////////////////////////////////////////////////////////////////////////
// entity animation profiles

function returnDefaultEntities(type) {
  switch(type) {
    case 'PlayerEntity': 
      return {
        'idle': new Animation( coinImg, 44, 44),
        'left': new Animation( coinImg, 44, 44, 15, true, [0,1]),
        'right': new Animation( coinImg, 44, 44, 15, true, [2,3]),
        'up': new Animation( coinImg, 44, 44, 15, true, 'reverse'),
        'down': new Animation( coinImg, 44, 44, 15, true, 'reverse'),
        'burrow': new Animation( coinImg, 44, 44, 15, true, [4]),
      };
      break;
    case 'FoodEntity': 
      return {
        'idle': new AnimationColor( ['#00ff00','#00dd00','#00bb00'], {x:0,y:0,w:10,h:10}), 
      }
      break;
  }
}
