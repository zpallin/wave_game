var player, camera, keys, world, water, fog;

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
  keys.register({ keys: [KEY.A], mode: 'up',   action: function() { player.left  = false; } });
  keys.register({ keys: [KEY.D], mode: 'up',   action: function() { player.right = false; } });
  keys.register({ keys: [KEY.W], mode: 'up',   action: function() { player.up    = false; } });
  keys.register({ keys: [KEY.S], mode: 'up',   action: function() { player.down  = false; } });
  keys.register({ keys: [KEY.SPACE], mode: 'up',   action: function() { player.burrow = false; } });
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

  // new entity connected
  socket.on('entity_connected', function(entityData) {
    // get entity here
    var pos = {x:0, y:0, w: entityData.size, h: entityData.size};
    entityMap[entityData.id] = new Entity(pos, returnDefaultEntities(entityData.type), entityData.layer);
    entityLayers[entityData.layer][entityData.id] = entityMap[entityData.id];
  });

  // existing entity left the game.
  socket.on('entity_disconnected', function(id) {
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
      entity.pos.x = entityData.pos.x;
      entity.pos.y = entityData.pos.y;

      if (entityData.size != entity.pos.w) {
        console.log("update anims: " + entity.anims.length);
        console.log(entity);

        for (var key in entity.anims) {
          var newSizeRatio = entityData.size / assumedEntitySize;
          console.log(newSizeRatio);
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
