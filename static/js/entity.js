////////////////////////////////////////////////////////////////////////////////
// entity

function Entity(pos, anims, layer) {
  this.pos = typeof pos === 'undefined' ? {x:0,y:0,w:50,h:50} : pos;
  this.layer = layer;
  this.anims = typeof anims === 'undefined' ? {} : anims;
  this.state = 'idle';
  this.visible = false;
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

Entity.prototype.render = function(name) {
  if (!this.visible || !(this.state in this.anims)) {
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
        'idle': new Animation( hermitIdleDown, 500, 333, 5),
        'left': new Animation( hermitWalkRight, 500, 333, 15, true),
        'right': new Animation( hermitWalkRight, 500, 333, 15, false),
        'up': new Animation( hermitIdleDown, 500, 333),
        'down': new Animation( hermitIdleDown, 500, 333, 15, true),
        'burrow': new Animation( hermitIdleDown, 500, 333, 5, false, false, [1,1,1,1,1,1,1]),
      };
      break;
    case 'FoodEntity': 
      return {
        'idle': new AnimationColor( ['#00ff00','#00dd00','#00bb00'], {x:0,y:0,w:10,h:10}), 
      }
      break;
    case 'WorldEntity':
      return {
        'idle': new Animation(sandImg, 512, 512)
      }
  }
}
