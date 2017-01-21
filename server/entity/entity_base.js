'use strict';

const ID_LENGTH = 5;
const CODE_BYTES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const COLORS = [
  "#00ff00",
  "#ff0000",
  "#0000ff",
  "#0ff000",
  "#000ff0",
  "#f0000f",
  "#ff0ff0",
  "#0ff0ff"
];

let entityMap = {};

function generateUniqueId(map) {
  let id = '';

  do {
    id = '';
    for (var i=0; i < ID_LENGTH; ++i) {
      id += CODE_BYTES.charAt(Math.floor(Math.random() * CODE_BYTES.length));
    }
  // Entity already exists under this name, try generating a new one.
  } while (!map || {}.hasOwnProperty.call(map, id));

  return id;
}

// Base class for all entities.
class EntityBase {
  constructor(world, io = null) {
    this.id = generateUniqueId(entityMap);
    this.io = io;
    this.pos = {x: 0, y: 0};
    this.size = {x: 0, y: 0};
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.world = world;
    this.world.addEntity(this);

    entityMap[this.id] = this;
  }

  destroy() {
    console.log('destroying entity ' + this.id);
    // Un-map our entity.
    this.world.removeEntity(this);
    delete entityMap[this.id];
    this.id = null;
  }

  // Retrieve the data needed for a client to know this entity.
  clientData() {
    return {
      id:    this.id,
      pos:   this.pos,
      size:  this.size,
      color: this.color
    };
  }

  update(elapsed) {

  }

  setPos(pos) {
    this.pos.x = pos.x;
    this.pos.y = pos.y;

    this.world.notifyNearbyPlayers('entity_moved', {
      id: this.id,
      pos: this.pos
    });
  }
};

module.exports = {
  EntityBase: EntityBase,
  entityMap: entityMap,
  generateUniqueId: generateUniqueId
};
