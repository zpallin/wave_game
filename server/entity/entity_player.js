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
    this.io.on('player_state', this.setState.bind(this));
    this.io.on('player_damage', this.damage.bind(this));
    this.io.on('disconnect', this.destroy.bind(this));
  }

  update(elapsed) {
    super.update(elapsed);
  }

  addScore(amount) {
    this.score += amount;

    this.setSize(Math.min(this.size + amount, 180));
  }

  setState(stateName) {
    this.world.notifyAllPlayers('entity_state', {
      id: this.id,
      state: stateName
    });
  }

  damage(pos) {
    // TODO: Find entities in the world that are in range.
    // TODO: do damage and knockback.

    // Notify everyone to play a particle effect.
    this.world.notifyAllPlayers('play_particle', {
      type: 'Attack',
      pos: pos
    });
  }
}

module.exports = {
  PlayerEntity: PlayerEntity
};
