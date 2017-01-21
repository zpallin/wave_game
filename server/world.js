'use strict';

const generateUniqueId = require('./entity/entity_base').generateUniqueId;
const FoodEntity = require('./entity/entity_food').FoodEntity;

const TILE_SIZE = 50;
const WORLD_GRID_WIDTH = 100;
const WORLD_GRID_HEIGHT = 20;

let worldMap = {};

class World {
  constructor(io) {
    this.id = generateUniqueId(worldMap);
    worldMap[this.id] = this;

    this.io = io;
    this.entityList = [];

    // Construct our world grid.
    this.grid = [];
    for (let x = 0; x < WORLD_GRID_WIDTH; ++x) {
      let row = [];
      for (let y = 0; y < WORLD_GRID_HEIGHT; ++y) {
        row.push({
          entityList: []
        });
      }
      this.grid.push(row);
    }

    this.updateIntervalId = setInterval(this.update.bind(this), 100);
  }

  destroy() {
    // TODO Remove all entities from the game.
  }

  // Broadcasts a message to all entities within this world.
  notifyAllPlayers(type, data) {
    this.io.to(this.id).emit(type, data);
  }

  // Notify players within range
  notifyNearbyPlayers(type, data) {
    // TODO: Actually figure out which players are near and only notify them.
    this.notifyAllPlayers(type, data);
  }

  addEntity(entity) {
    if (this.entityList.indexOf(entity) > -1) {
      return false;
    }

    // If this entity has a socket connection, connect to our worlds channel.
    if (entity.io) {
      entity.io.join(this.id);
      this.notifyAllPlayers('entity_connected', entity.clientData());

      // Now notify the newly added player of all the other entities in the world.
      this.entityList.forEach((other)=> {
        entity.io.emit('entity_connected', other.clientData());
      });
    }
    this.entityList.push(entity);
    console.log(`Entity ${entity.id} joined world ${this.id}`);
    return true;
  }

  removeEntity(entity) {
    let index = this.entityList.indexOf(entity);
    if (index === -1) {
      return false;
    }

    console.log(`Entity ${entity.id} left world ${this.id}`);
    this.entityList.splice(index, 1);
    // If this entity has a socket connection, disconnect from our worlds channel.
    if (entity.io) {
      entity.io.leave(this.id);
      this.notifyAllPlayers('entity_disconnected', entity.id);
    }
  }

  update() {
    // TODO: Update the game here!
  }
}

module.exports = {
  World: World
};
