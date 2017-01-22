'use strict';

const generateUniqueId = require('./entity/entity_base').generateUniqueId;
const FoodEntity = require('./entity/entity_food').FoodEntity;

// This is the size of a single grid tile.
const GRID_SIZE = 128;

// These keep track of how many grid tiles there are in the entire map.
const WORLD_GRID_WIDTH = 100;
const WORLD_GRID_HEIGHT = 20;

// These keep track of how large the players camera view is in relation to our grid size.
const CAMERA_GRID_WIDTH = 5;
const CAMERA_GRID_HEIGHT = 5;

const TEMP_VIEW_RANGE = 10000;

const WAVE_SPEED = 128;
const WAVE_TIME = 5000;
const WAVE_WARNING_TIME = 1000;

const WAVE_STATE_IDLE = 0;
const WAVE_STATE_FLOODING = 1;
const WAVE_STATE_RECEEDING = 2;


// Maps for keeping track of things
let worldMap = {};
let entityTracker = {};

class World {
  constructor(io) {
    this.id = generateUniqueId(worldMap);
    worldMap[this.id] = this;
    this.lastTime = new Date().getTime();
    this.waveTime = WAVE_TIME;
    this.waveState = WAVE_STATE_IDLE;

    this.io = io;
    this.entityList = [];
    this.waterHeight = 0;

    // Construct our world grid.
    this.grid = [];
    for (let x = 0; x < WORLD_GRID_WIDTH; ++x) {
      let row = [];
      for (let y = 0; y < WORLD_GRID_HEIGHT; ++y) {
        row.push({
          entityList: [],
          pos: {
            x,
            y
          }
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

  addEntity(entity) {
    if (this.entityList.indexOf(entity) > -1) {
      return false;
    }

    // If this entity has a socket connection, connect to our worlds channel.
    if (entity.io) {
      entity.io.join(this.id);

      // Now notify the newly added player of all the other entities in the world.
      this.entityList.forEach((other)=> {
        entity.io.emit('entity_connected', other.clientData());
      });
    }

    this.notifyAllPlayers('entity_connected', entity.clientData());

    this.entityList.push(entity);
    console.log(`Entity ${entity.id} joined world ${this.id}`);

    // Update the tracking for this entity
    this.onEntityMoved(entity);
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

  // Event handler when an entity has moved.
  onEntityMoved(entity) {
    // First determine if the entity is moving into another grid space.
    let changingSpaces = true;
    let trackedGrid = entityTracker[entity.id];
    let gridPos = this.getGridPos(entity.pos);
    
    if (trackedGrid) {
      if (gridPos.x === trackedGrid.x && gridPos.y === trackedGrid.y) {
        changingSpaces = false;
      }
    }

    // If we have determined that this entity is moving to another grid space, 
    // we will have to move them and notify players as appropriate.
    if (changingSpaces) {
      if (trackedGrid) {
        let index = trackedGrid.entityList.indexOf(entity);
        if (index > -1) {
          trackedGrid.entityList.splice(index, 1);
        }
      }
      let gridSpace = this.grid[gridPos.x][gridPos.y];
      entityTracker[entity.id] = gridSpace;
      gridSpace.entityList.push(entity);

      let removedEntityList = this.getEntitiesInRange(
        entity.pos, TEMP_VIEW_RANGE, TEMP_VIEW_RANGE + GRID_SIZE, false, entity.id);

      removedEntityList.forEach((removedEntity)=> {
        if (removedEntity.io) {
          removedEntity.io.emit('entity_hidden', entity.id);
        }
      });
    }

    let notifyEntityList = this.getEntitiesInRange(
      entity.pos, 0, TEMP_VIEW_RANGE, false);

    notifyEntityList.forEach((notifyEntity)=> {
      if (notifyEntity.io) {
        notifyEntity.io.emit('entity_moved', {
          id: entity.id,
          pos: entity.pos
        });
      }
    });
  }

  // Finds the grid tile position for a given world position.
  getGridPos(pos) {
    return {
      x: Math.max(0, Math.min(WORLD_GRID_WIDTH, Math.floor(pos.x / GRID_SIZE))),
      y: Math.max(0, Math.min(WORLD_GRID_HEIGHT, Math.floor(pos.y / GRID_SIZE)))
    };
  }

  // Finds all entities within a certain pixel range of a position
  getEntitiesInRange(pos, minRange, maxRange, exact, ignoredEntityId) {
    let gridPos = this.getGridPos(pos);

    // This assumes entities will not be larger than two grid tiles.
    let gridRange = Math.floor(maxRange / GRID_SIZE)+2;

    let resultList = [];
    for (let x = gridPos.x - gridRange; x < gridPos.x + gridRange; ++x) {
      for (let y = gridPos.y - gridRange; y < gridPos.y + gridRange; ++y) {
        if (x >= 0 && y >= 0 && x < WORLD_GRID_WIDTH && y < WORLD_GRID_HEIGHT) {
          this.grid[x][y].entityList.forEach((entity)=> {
            if (entity.id === ignoredEntityId) {
              return;
            }

            // Do an actual distance check to see if this is within the range.
            // The first test is checking within a square on the x and y distance.
            let w = Math.abs(entity.pos.x - pos.x);
            let h = Math.abs(entity.pos.y - pos.y);
            if (w - (entity.size/2) > maxRange || w + (entity.size/2) < minRange ||
                h - (entity.size/2) > maxRange || h + (entity.size/2) < minRange) {
              return;
            }

            // Only if we specify we want it to be entirely
            // accurate, we'll do a distance calculation.
            if (exact) {
              let vectorX = entity.pos.x - pos.x;
              let vectorY = entity.pos.y - pos.y;
              let distance = Math.sqrt((vectorX*vectorX)+(vectorY*vectorY)) - entity.radius;
              if (distance > maxRange || distance < minRange) {
                return;
              }

              resultList.push(entity);
            } else {
              // We don't care about being exact, but we still want a ball-park distance value.
              resultList.push(entity);
            }
          });
        }
      }
    }
    return resultList;
  }

  // Finds all entities in the water
  getEntitiesInWater() {
    // This assumes entities will not be larger than two grid tiles.
    let gridRange = Math.floor(this.waterHeight / GRID_SIZE)+2;
    
    let resultList = [];
    for (let x = 0; x < WORLD_GRID_WIDTH; ++x) {
      for (let y = WORLD_GRID_HEIGHT-gridRange; y < WORLD_GRID_HEIGHT; ++y) {
        if (x >= 0 && y >= 0 && x < WORLD_GRID_WIDTH && y < WORLD_GRID_HEIGHT) {
          this.grid[x][y].entityList.forEach((entity)=> {
            // We simply only need to check the water height.
            if (entity.pos.y > (GRID_SIZE * WORLD_GRID_HEIGHT) - this.waterHeight) {
              resultList.push(entity);
            }
          });
        }
      }
    }
    return entityList;
  }

  update() {
    // let time = new Date().getTime();
    // let elapsed = time - this.lastTime;
    // this.lastTime = time;

    // switch (this.waveState) {
    //   case WAVE_STATE_IDLE: {
    //     this.waveTime -= elapsed;
    //     if (this.waveTime <= 0) {
    //       this.waveTime = WAVE_TIME;
    //       this.isWaving;
    //     } else if (this.waveTime <= WAVE_WARNING_TIME) {
    //       let warningIntensity = 1.0 - (this.waveTime / WAVE_WARNING_TIME);
    //       this.notifyAllPlayers('fog_warning', warningIntensity);
    //     }

    //     break;
    //   }
    // }

    // if (this.isWaving) {
    //   this.waterHeight += (elapsed / 1000) * WAVE_SPEED;
    //   if (this.waterHeight > GRID_SIZE * WORLD_GRID_HEIGHT) {
    //     this.waterHeight = GRID_SIZE * WORLD_GRID_HEIGHT;
    //   }
    // } else {
    //   if (this.waterHeight > 0) {
    //     this.waterHeight -= (elapsed / 1000) * WAVE_SPEED;
    //     if (this.waterHeight <= 0) {
    //       this.waterHeight = 0;
    //     }
    //   } else {
    //     this.waveTime -= elapsed;
    //     if (this.waveTime <= 0) {
    //       this.waveTime = WAVE_TIME;
    //       this.isWaving;
    //     } else if (this.waveTime <= WAVE_WARNING_TIME) {
    //       let warningIntensity = 1.0 - (this.waveTime / WAVE_WARNING_TIME);
    //       this.notifyAllPlayers('fog_warning', warningIntensity);
    //     }
    //   }
    // }
  }
}

module.exports = {
  World: World
};
