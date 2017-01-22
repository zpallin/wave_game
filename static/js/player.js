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
}

Player.prototype.modSpeed = function() {
  return (6 / this.pos.w) * this.speed * 10;
}

Player.prototype.updateControls = function(dt, bounds) {
  this.move(bounds);
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


	if (newState != 'burrow') {
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
	}

  helpers.clamp(this.pos, bounds);

  //console.log(this.pos);
	this.entity.setState(newState);

  if (this.pos.x !== oldPos.x || this.pos.y !== oldPos.y) {
    socket.emit('player_move', {x: this.pos.x, y: this.pos.y});
  }
}
