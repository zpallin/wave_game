var player, camera, keys;

// world
function render() {
  ctx.save();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  camera.focus();
  world.render();
  for (var layer = 0; layer < entityLayers.length; ++layer) {
    var map = entityLayers[layer];
    for (var id in map) {
      map[id].render();
    }
  }
  water.render();
  fog.render();
  ctx.restore();
}

function update(dt) {
  camera.follow(dt);
  water.update(dt);
  fog.update(dt);
  for (var layer = 0; layer < entityLayers.length; ++layer) {
    var map = entityLayers[layer];
    for (var id in map) {
      map[id].update(dt);
    }
  }
  if (typeof player !== 'undefined') {
    player.updateControls(dt, world.pos);
  }
}

function reset() {
  keys = new Keys();

  var worldPos = {
    x: 0,
    y: 0,
    w: parseInt(document.getElementById('worldWidth').innerText, 10),
    h: parseInt(document.getElementById('worldHeight').innerText, 10)
  };
  world = new World(worldPos);
  water = new Water(worldPos);
  fog = new Fog(worldPos);
  camera = new Camera(world);
  keys.register({ keys: [KEY.A], mode: 'down', action: function() { player.left  = true;  } });
  keys.register({ keys: [KEY.D], mode: 'down', action: function() { player.right = true;  } });
  keys.register({ keys: [KEY.W], mode: 'down', action: function() { player.up    = true;  } });
  keys.register({ keys: [KEY.S], mode: 'down', action: function() { player.down  = true;  } });
  keys.register({ keys: [KEY.SPACE], mode: 'down', action: function() { player.burrow = true;  } });
  keys.register({ keys: [KEY.LEFT], mode: 'down', action: function() { 
    player.attackLeft = true; } 
  });
  keys.register({ keys: [KEY.RIGHT], mode: 'down', action: function() { 
    player.attackRight = true; } 
  });
  keys.register({ keys: [KEY.A], mode: 'up',   action: function() { player.left  = false; } });
  keys.register({ keys: [KEY.D], mode: 'up',   action: function() { player.right = false; } });
  keys.register({ keys: [KEY.W], mode: 'up',   action: function() { player.up    = false; } });
  keys.register({ keys: [KEY.S], mode: 'up',   action: function() { player.down  = false; } });
  keys.register({ keys: [KEY.SPACE], mode: 'up',   action: function() { player.burrow = false; } });
  keys.register({ keys: [KEY.LEFT], mode: 'up', action: function() { 
    player.attackLeft = false; } 
  });
  keys.register({ keys: [KEY.RIGHT], mode: 'up', action: function() { 
    player.attackRight = false; } 
  });

  keys.setListeners();
}

function run() {
  socket = io.connect('/');

  var now = null;
  var last = new Date().getTime();
  var dt = 0;
  var gdt = 0;
  reset();

  function frame() {
    now = new Date().getTime();
    dt = Math.min(1, (now - last) / 1000);

    update(dt);
    render();
    last = now;
    //window.setTimeout(frame, 1000 / 60);
    window.requestAnimationFrame(frame);
  }

  var isReloading = false;
  socket.on('connect', function() {
    if (isReloading) {
      location = '/';
    }
  });

  socket.on('disconnect', function() {
    isReloading = true;
    socket.io.reconnect();
  });

  // new entity connected
  socket.on('entity_connected', function(entityData) {
    // get entity here
    var pos = {x:0, y:0, w: entityData.size, h: entityData.size};
    entityMap[entityData.id] = new Entity(pos, returnDefaultEntities(entityData.type), entityData.layer, entityData.id);
    entityLayers[entityData.layer][entityData.id] = entityMap[entityData.id];
  });

  // existing entity left the game.
  socket.on('entity_disconnected', function(id) {
    if (id === player.entity.id) {
      location = '/';
    }
    var entity = entityMap[id];
    if (entity) {
      delete entityLayers[entity.layer][id];
    }
    delete entityMap[id];
  });

  // Your identifier
  socket.on('set_identity', function(id) {
    var pos = {x:0, y:0, w: entityMap[id].pos.w, h: entityMap[id].pos.h};
    player = new Player(entityMap[id]);
    camera.setEntity(player.entity);

    // Now that we know who we are, let's start playing!
    frame();
  });

  // now get the data
  socket.on('entity_moved', function(entityData) {
    var entity = entityMap[entityData.id];
    if (entity) {
      if (player && (entityData.id !== player.entity.id || player.entity.state === 'washOut')) {
        entity.pos.x = entityData.pos.x;
        entity.pos.y = entityData.pos.y;
      }

      if (entityData.size != entity.pos.w) {
        for (var key in entity.anims) {
          var newSizeRatio = entityData.size / assumedEntitySize;
          entity.anims[key].speed = assumedEntitySize / entityData.size;
        }
      }

      entity.pos.w = entityData.size;
      entity.pos.h = entityData.size;
      
      entity.visible = true;
    }
  });

  // Entity is hidden from view.
  socket.on('entity_hidden', function(id) {
    var entity = entityMap[id];
    if (entity) {
      entity.visible = false;
    }
  });

  socket.on('fog_intensity', function(alpha) {
    fog.setAlpha(alpha);
  });

  socket.on('water_height', function(height) {
    water.setHeight(height);
  });

  socket.on('entity_state', function(data) {
    var entity = entityMap[data.id];
    if (entity) {
      entity.setState(data.state);
    }
  });

  socket.on('play_particle', function(data) {
    // TODO: data.type is the type of particle to play.
    // TODO: data.pos is the position.
  });
}

if (document.addEventListener) {
  document.addEventListener('DOMContentLoaded', run, false);
} else if (window.addEventListener) {
  window.addEventListener('load', run, false);
} else if (document.attachEvent) {
  document.attachEvent('onreadystatechange', run);
} else if (window.attachEvent) {
  window.attachEvent('onload', run);
}
