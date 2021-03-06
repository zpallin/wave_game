'use strict';

const generateUniqueId = require('./entity/entity_base').generateUniqueId;
const FoodEntity = require('./entity/entity_food').FoodEntity;

// This is the size of a single grid tile.
const GRID_SIZE = 100;

// These keep track of how many grid tiles there are in the entire map.
const WORLD_GRID_WIDTH = 20;
const WORLD_GRID_HEIGHT = 5;

// These keep track of how large the players camera view is in relation to our grid size.
const CAMERA_GRID_WIDTH = 5;
const CAMERA_GRID_HEIGHT = 5;

const VIEW_DISTANCE = 300;

const WAVE_SPEED = GRID_SIZE * WORLD_GRID_HEIGHT / 2;
const WAVE_TIME = 5000;
const WAVE_WARNING_TIME = 1000;

const WAVE_STATE_IDLE = 0;
const WAVE_STATE_FLOODING = 1;
const WAVE_STATE_RECEEDING = 2;

const KNOCKBACK_DAMPER = 0.25;

// food amounts
const FOOD_RAND_MAX = Math.floor(WORLD_GRID_WIDTH * GRID_SIZE / 100);
const FOOD_RAND_MIN = Math.floor(FOOD_RAND_MAX / 2);

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
    this.entityMap = {};
    this.waterHeight = 0;

    // food count
    this.existingFoodCount = 0;

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
    // console.log(type, data);
  }

  addEntity(entity) {
    if ({}.hasOwnProperty.call(this.entityMap, entity.id)) {
      return false;
    }

    // If this entity has a socket connection, connect to our worlds channel.
    if (entity.io) {
      entity.io.join(this.id);

      // Now notify the newly added player of all the other entities in the world.
      for (let other in this.entityMap) {
        if ({}.hasOwnProperty.call(this.entityMap, other)) {
          entity.io.emit('entity_connected', this.entityMap[other].clientData());
        }
      }
    }

    this.notifyAllPlayers('entity_connected', entity.clientData());

    this.entityMap[entity.id] = entity;
    console.log(`${entity.constructor.name} ${entity.id} joined world ${this.id}`);

    // Update the tracking for this entity
    this.onEntityMoved(entity);
    return true;
  }

  removeEntity(entity) {
    if (!{}.hasOwnProperty.call(this.entityMap, entity.id)) {
      return false;
    }

    console.log(`Entity ${entity.id} left world ${this.id}`);

    let trackedGrid = entityTracker[entity.id];
    if (trackedGrid) {
      let index = trackedGrid.entityList.indexOf(entity);
      if (index > -1) {
        trackedGrid.entityList.splice(index, 1);
      }
      delete entityTracker[entity.id];
    }

    if (entity.constructor.name === 'FoodEntity') {
      this.existingFoodCount--;
    }

    delete this.entityMap[entity.id];
    // If this entity has a socket connection, disconnect from our worlds channel.
    if (entity.io) {
      entity.io.leave(this.id);
    }

    this.notifyAllPlayers('entity_disconnected', entity.id);
  }

  // Event handler when an entity has moved.
  onEntityMoved(entity, ignoreCollision) {
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
        entity.pos, VIEW_DISTANCE, VIEW_DISTANCE + GRID_SIZE, false, entity.id);

      removedEntityList.forEach((removedEntity)=> {
        if (removedEntity.io) {
          removedEntity.io.emit('entity_hidden', entity.id);
        }
        if (entity.io) {
          entity.io.emit('entity_hidden', removedEntity.id);
        }
      });
    }

    let notifyEntityList = this.getEntitiesInRange(
      entity.pos, 0, VIEW_DISTANCE, false);

    notifyEntityList.forEach((notifyEntity)=> {
      if (notifyEntity.io) {
        notifyEntity.io.emit('entity_moved', {
          id: entity.id,
          pos: entity.pos,
          size: entity.size
        });
      }
      if (entity.io) {
        entity.io.emit('entity_moved', {
          id: notifyEntity.id,
          pos: notifyEntity.pos,
          size: notifyEntity.size
        });
      }
    });

    // Only players from this point on!
    if (!ignoreCollision && entity.constructor.name === 'PlayerEntity') {
      let touchedEntityList = this.getEntitiesInRange(
        entity.pos, 0, entity.size/2, true, entity.id);
      let addScore = 0;
      touchedEntityList.forEach((touched)=> {
        switch (touched.constructor.name) {
          // Pick up food and grow bigger.
          case 'FoodEntity': {
            touched.destroy();
            addScore += 0.1;
            break;
          }
          // Coliision with other players.
          case 'PlayerEntity': {
            let vec = {
              x: entity.pos.x - touched.pos.x,
              y: entity.pos.y - touched.pos.y
            };
            let ratio = entity.size / (entity.size + touched.size);
            if (!entity.isBurrowed) {
              entity.setPos({
                x: entity.pos.x + (vec.x * ratio) * KNOCKBACK_DAMPER,
                y: entity.pos.y + (vec.y * ratio) * KNOCKBACK_DAMPER
              }, true);
            }
            if (!touched.isBurrowed) {
              touched.setPos({
                x: touched.pos.x - (vec.x * (1.0 - ratio)) * KNOCKBACK_DAMPER,
                y: touched.pos.y - (vec.y * (1.0 - ratio)) * KNOCKBACK_DAMPER
              }, true);
            }
          }
        }
      });
      if (addScore > 0) {
        entity.addScore(addScore);
      }
    }
  }

  // Finds the grid tile position for a given world position.
  getGridPos(pos) {
    return {
      x: Math.max(0, Math.min(WORLD_GRID_WIDTH-1, Math.floor(pos.x / GRID_SIZE))),
      y: Math.max(0, Math.min(WORLD_GRID_HEIGHT-1, Math.floor(pos.y / GRID_SIZE)))
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
            if (w - (entity.size/2) > maxRange || h - (entity.size/2) > maxRange ||
               (w + (entity.size/2) < minRange && h + (entity.size/2) < minRange)) {
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
    return resultList;
  }

  update() {
    let time = new Date().getTime();
    let elapsed = time - this.lastTime;
    this.lastTime = time;

    switch (this.waveState) {
      case WAVE_STATE_IDLE: {
        this.waveTime -= elapsed;
        if (this.waveTime <= 0) {
          this.waveTime = WAVE_TIME;
          this.waveState = WAVE_STATE_FLOODING;
        } else if (this.waveTime <= WAVE_WARNING_TIME) {
          let fogIntensity = 1.0 - (this.waveTime / WAVE_WARNING_TIME);
          this.notifyAllPlayers('fog_intensity', fogIntensity);
        }

        break;
      }

      case WAVE_STATE_FLOODING: {
        this.waterHeight += (elapsed / 1000) * WAVE_SPEED;
        if (this.waterHeight > GRID_SIZE * WORLD_GRID_HEIGHT) {
          this.waterHeight = GRID_SIZE * WORLD_GRID_HEIGHT;
          this.waveState = WAVE_STATE_RECEEDING;
          this.spawnFood();
        }
        this.notifyAllPlayers('water_height', this.waterHeight);

        // loop through and washout all entities
        this.getEntitiesInWater().forEach(function(entity) {
          if (entity.constructor.name === 'PlayerEntity' && !entity.isBurrowed && !entity.isWashedOut) {
            console.log("Washout:" + entity.id);
            entity.setState('washOut');
            entity.isWashedOut = true;
          }
        });
        break;
      }

      case WAVE_STATE_RECEEDING: {
        let distance = (elapsed / 1000) * WAVE_SPEED;
        this.waterHeight -= distance;
        if (this.waterHeight <= 0) {
          this.waterHeight = 0;
          this.waveState = WAVE_STATE_IDLE;
          this.waveTime = WAVE_TIME;
        }
        this.notifyAllPlayers('water_height', this.waterHeight);

        let fogIntensity = this.waterHeight / (GRID_SIZE * WORLD_GRID_HEIGHT);
        this.notifyAllPlayers('fog_intensity', fogIntensity);

        for (let name in this.entityMap) {
          let entity = this.entityMap[name];
          if (entity.constructor.name === 'PlayerEntity' && entity.isWashedOut) {
            if (entity.pos.y - 100 < (GRID_SIZE * WORLD_GRID_HEIGHT) - this.waterHeight) {
              entity.setPos({
                x: entity.pos.x,
                y: entity.pos.y + distance
              }, true);

              if (this.waterHeight <= 0) {
                this.notifyAllPlayers('entity_disconnected', entity.id);
              }
            }
          }
        };
        break;
      }
    }

    
  }

  spawnFood() {
    var foodCount = Math.floor(Math.random() * (FOOD_RAND_MIN - FOOD_RAND_MAX)) + FOOD_RAND_MIN;
    if ((foodCount + this.existingFoodCount) > FOOD_RAND_MAX) {
      foodCount = FOOD_RAND_MAX - this.existingFoodCount;
    }
    console.log("food count: " + foodCount + " / " + this.existingFoodCount);
    for (var i = 0; i < foodCount; i++, this.existingFoodCount++) {
      var food = new FoodEntity(this);
      food.setSize(10);

      // randomly generate x and y
      var x = Math.floor(Math.random() * (WORLD_GRID_WIDTH * GRID_SIZE));

      // y is harder
      var gridHeight = Math.floor(WORLD_GRID_HEIGHT * GRID_SIZE);
      var bottomRange = Math.floor(Math.random() * (gridHeight / 3));
      var midRange = Math.floor(Math.random() * (gridHeight / 5));
      var y = gridHeight - bottomRange - midRange;
      food.setPos({x:x, y:y});
    }
  }
}

module.exports = {
  World: World,
  worldSize: {
    x: WORLD_GRID_WIDTH * GRID_SIZE,
    y: WORLD_GRID_HEIGHT * GRID_SIZE
  }
};
