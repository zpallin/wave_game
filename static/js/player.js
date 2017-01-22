////////////////////////////////////////////////////////////////////////////////
// player object

function getHermitEntity(ctx, pos) {
  var animations = {
    'idle': new Animation(ctx, coinImg, 44, 44),
    'left': new Animation(ctx, coinImg, 44, 44, 15, true, [0,1]),
    'right': new Animation(ctx, coinImg, 44, 44, 15, true, [2,3]),
    'up': new Animation(ctx, coinImg, 44, 44, 15, true, 'reverse'),
    'down': new Animation(ctx, coinImg, 44, 44, 15, true, 'reverse'),
    'burrow': new Animation(ctx, coinImg, 44, 44, 15, true, [4]),
  };

  return new Entity(ctx, pos, animations);
}

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

Player.prototype.update = function(dt) {
  this.move();
  this.entity.update(dt);
  console.log(this.pos);
}

Player.prototype.render = function() {
  this.entity.render();
}

Player.prototype.reset = function() {
  this.entity.reset();
}

Player.prototype.move = function() {
	var newState = this.entity.state;

	if (newState != 'burrow') {

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
	this.entity.setState(newState);
}
