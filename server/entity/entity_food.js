'use strict';

const EntityBase = require('./entity_base').EntityBase;

class FoodEntity extends EntityBase {
  constructor(world) {
    super(world, null);
  }

  update(elapsed) {
    super.update(elapsed);
  }
}

module.exports = {
  FoodEntity: FoodEntity
};
