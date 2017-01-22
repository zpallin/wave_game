'use strict';

const layerType = require('./entity_base').layerType;
const EntityBase = require('./entity_base').EntityBase;

class FoodEntity extends EntityBase {
  constructor(world) {
    super(world, layerType.LAYER_FOOD);
  }

  update(elapsed) {
    super.update(elapsed);
  }
}

module.exports = {
  FoodEntity: FoodEntity
};
