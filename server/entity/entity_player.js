'use strict';

const layerType = require('./entity_base').layerType;
const EntityBase = require('./entity_base').EntityBase;

class PlayerEntity extends EntityBase {
  constructor(world, io) {
    super(world, layerType.LAYER_HERMIT, io);

    this.isBurrowed = false;
    this.breath = 100;
    this.score = 0;

    this.io.emit('set_identity', this.id);

    this.io.on('player_move', this.setPos.bind(this));
    this.io.on('disconnect', this.destroy.bind(this));
  }

  update(elapsed) {
    super.update(elapsed);
  }

  addScore(amount) {
    this.score += amount;

    this.setSize(Math.min(this.size + amount, 180));
  }
}

module.exports = {
  PlayerEntity: PlayerEntity
};
