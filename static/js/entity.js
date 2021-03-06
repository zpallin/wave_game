////////////////////////////////////////////////////////////////////////////////
// entity

function Entity(pos, anims, layer, id) {
  this.id = typeof id === 'undefined' ? null : id;
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
        'attackLeft': new Animation( hermitAttackRight, 500, 333, 12, false, false, [1,2,3,1]),
        'attackRight': new Animation( hermitAttackLeft, 500, 333, 12, false, false, [1,2,3,1]),
        'idle': new Animation( hermitIdleDown, 500, 333, 5),
        'idleRight': new Animation( hermitIdleRight, 500, 333, 5),
        'idleLeft': new Animation( hermitIdleRight, 500, 333, 5, true),
        'left': new Animation( hermitWalkLeft, 500, 333, 15),
        'leftDown': new Animation( hermitWalkDown, 500, 333, 15, true),
        'rightDown': new Animation( hermitWalkDown, 500, 333),
        'right': new Animation( hermitWalkRight, 500, 333, 15, false),
        'up': new Animation( hermitWalkUp, 500, 333),
        'leftUp': new Animation( hermitWalkUp, 500, 333, 15, true),
        'rightUp': new Animation( hermitWalkUp, 500, 333),
        'down': new Animation( hermitWalkDown, 500, 333, 15, true),
        'burrow': new Animation( hermitBurrow, 500, 333, 5, false, false, [0,1,2,2,2,2,2,2,2,2,2,1,0]),
        'washOut': new Animation( hermitDeath, 500, 333, 5, 'vertical', true, [0,1]),
        'knockBackRight': new Animation( hermitSurprise, 500, 333, 5, 'vertical', false, [1,1,1]),
        'knockBackLeft': new Animation( hermitSurprise, 500, 333, 5, 'vertical', false, [1,1,1]),
      };
      break;
    case 'FoodEntity': 
      return {
        'idle': new AnimationColor( ['#00ff00','#00dd00','#00bb00'], {x:0,y:0,w:2,h:2}), 
      }
      break;
    case 'WorldEntity':
      return {
        'idle': new Animation(sandImg, 512, 512)
      }
  }
}
        
////////////////////////////////////////////////////////////////////////////////
// special entity: scratch
// NOT BEING USED YET (OR PROBABLY AT ALL)
var scratches = {};
function Scratch(x,y,size) {
  this.x = x;
  this.y = y;
  this.w = 30;
  this.h = 30;
  this.size = size;
  this.name = helpers.randomStr();
  this.anim = new Animation(scratchImg, this.w, this.h, 5, false, false, [0,1,2]);
  scratches[this.name] = this;
}
Scratch.prototype.update = function(dt) {
  if (!this.anim.update()) {
    delete scratches[this.name];
  }
}
Scratch.prototype.render = function() {
  ctx.save();
  ctx.translate(this.x, this.pos.y - this.pos.h / 2);
  ctx.scale(this.pos.w / anim.w, this.pos.h / anim.h);
  anim.draw();
  ctx.restore();
}

function callScratch(x,y,size) {
    
}
