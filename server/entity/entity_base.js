'use strict';

let entityMap = {};

// Base class for all entities.
class EntityBase {
  constructor() {
    this.id = generateId();
    this.pos = {x: 0, y: 0};
    this.size = {x: 0, y: 0};
    this.color = 'red';
  }

  generateId() {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';

    do {
      id = '';
      for (var i=0; i < 5; ++i) {
        id += possible.charAt(Math.floor(Math.random() * possible.length));
      }
    // Entity already exists under this name, try generating a new one.
    while ({}.hasOwnProperty.call(entityMap, id))
    entityMap[id] = this;

    return id;
  }

  destroy() {
    // Un-map our entity.
    delete entityMap[this.id];
    this.id = null;
  }

  update(elapsed) {

  }
};

module.export = EntityBase;
