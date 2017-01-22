////////////////////////////////////////////////////////////////////////////////
// player object

function Player(entity, speed) {
  this.pos = entity.pos;
  this.speed = typeof speed === 'undefined' ? 10 : speed;
  
  this.left = false;
  this.down = false;
  this.right = false;
  this.up = false;
	this.burrow = false;
  this.entity = entity;
  this.attackFrameStart = 2;
  this.resetAttack();
  this.runThrough = ['burrow', 'attackRight', 'attackLeft'];
}

Player.prototype.modSpeed = function() {
  return (6 / this.pos.w) * this.speed * 10;
}

Player.prototype.updateControls = function(dt, bounds) {
  this.move(bounds);
  this.attack(dt);
}

Player.prototype.attack = function(dt) {
  if (this.attackRight) {
    var animIdx = this.entity.anims['attackLeft'].idx;
    console.log('animIdx: ' + animIdx);

    if (animIdx >= this.attackFrameStart) {
      console.log('rightattack');
      socket.emit('player_attack_zone', {
        x: this.pos.x + this.pos.w / 2,
        y: this.pos.y + this.pos.h / 2,
        w: this.pos.w / 6,
        h: this.pos.h / 6,
      });
    }

  }
  if (this.attackLeft) {
    var animIdx = this.entity.anims['attackLeft'].idx;
    console.log('animIdx: ' + animIdx);
    
    if (animIdx >= this.attackFrameStart) {
      console.log('leftattack');
      socket.emit('player_attack_zone', {
        x: this.pos.x + this.pos.w / 2,
        y: this.pos.y + this.pos.h / 2,
        w: this.pos.w / 6,
        h: this.pos.h / 6,
      });
    }
  }
}

Player.prototype.resetAttack = function() {
  this.attackIncrement = 0;
}

Player.prototype.render = function() {
  this.entity.render();
}

Player.prototype.reset = function() {
  this.entity.reset();
}

Player.prototype.move = function(bounds) {
  var newState = this.entity.state;
  var oldPos = {
    x: this.pos.x,
    y: this.pos.y
  };

	if (this.runThrough.indexOf(newState) === -1) {
	  newState = 'idle';

		if (this.left) {
			this.pos.x -= this.modSpeed();
			newState = 'left';
		}
		if (this.right) {
			this.pos.x += this.modSpeed();
			newState = 'right';
		}
		if (this.down) {
			this.pos.y += this.modSpeed();
			newState = 'down';
		}
		if (this.up) {
			this.pos.y -= this.modSpeed();
			newState = 'up';
		}
    if (this.right && this.up) {
      newState = 'rightUp';
    }
    if (this.right && this.down) {
      newState = 'rightDown';
    }
    if (this.left && this.up) {
      newState = 'leftUp';
    }
    if (this.left && this.down) {
      newState = 'leftDown';
    }
		if (this.burrow) {
			newState = 'burrow';
		}
    if (this.attackRight) {
      console.log(this.attackRight);
      newState = 'attackRight';
    }
    if (this.attackLeft) {
      console.log(this.attackLeft);
      newState = 'attackLeft';
    }
	}


  helpers.clamp(this.pos, bounds);

  //console.log(this.pos);
	this.entity.setState(newState);

  if (this.pos.x !== oldPos.x || this.pos.y !== oldPos.y) {
    socket.emit('player_move', {x: this.pos.x, y: this.pos.y});
  }
}
