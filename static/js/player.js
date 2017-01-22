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
	var newState = 'idle';

	if (this.entity.state != 'burrow') {

		if (this.left) {
			this.pos.x -= this.speed;
			newState = 'left';
		}
		if (this.right) {
			this.pos.x += this.speed;
			newState = 'right';
		}
		if (this.down) {
			this.pos.y += this.speed;
			newState = 'down';
		}
		if (this.up) {
			this.pos.y -= this.speed;
			newState = 'up';
		}
		if (this.burrow) {
			newState = 'burrow';
		}
	}

  helpers.clamp(this.pos, bounds);

  //console.log(this.pos);
	this.entity.setState(newState);
  socket.emit('player_move', {x: this.pos.x, y: this.pos.y});
}
