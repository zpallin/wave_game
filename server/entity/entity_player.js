'use strict';

const EntityBase = require('./entity_base').EntityBase;

class PlayerEntity extends EntityBase {
  constructor(world, io) {
    super(world, io);

    this.isBurrowed = false;
    this.breath = 100;

    this.io.emit('set_identity', this.id);

    this.io.on('player_move', this.setPos.bind(this));
    this.io.on('disconnect', this.destroy.bind(this));
  }

  update(elapsed) {
    super.update(elapsed);
  }
}

module.exports = {
  PlayerEntity: PlayerEntity
};
