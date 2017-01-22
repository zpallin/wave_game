var player, camera, keys, world;
var colorTest = new AnimationColor( ['#00ff00', '#00dd00', '#00bb00'], {x: 0, y: 0, w:50, h:50});
var animTest = new Animation( coinImg, 44, 44, 15, false);

// world
function render(dt) {
	ctx.save();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  camera.focus();
	camera.follow(dt);
  world.render();
  if (typeof player !== 'undefined') {
  	player.render();
  }
  ctx.restore();
}

function update(dt) {
  world.update();
  if (typeof player !== 'undefined') {
    player.update(dt);
    helpers.clamp(player.pos,world.pos);
  }
}

function reset() {
  keys = new Keys();
  world = new World();
  camera = new Camera( canvas, world.entity);
	keys.register({ keys: [KEY.A], mode: 'down', action: function() { player.left  = true;  } });
	keys.register({ keys: [KEY.D], mode: 'down', action: function() { player.right = true;  } });
	keys.register({ keys: [KEY.W], mode: 'down', action: function() { player.up    = true;  } });
	keys.register({ keys: [KEY.S], mode: 'down', action: function() { player.down  = true;  } });
	keys.register({ keys: [KEY.A], mode: 'up',   action: function() { player.left  = false; } });
	keys.register({ keys: [KEY.D], mode: 'up',   action: function() { player.right = false; } });
	keys.register({ keys: [KEY.W], mode: 'up',   action: function() { player.up    = false; } });
	keys.register({ keys: [KEY.S], mode: 'up',   action: function() { player.down  = false; } });
	keys.setListeners();
}

function run() {
  var now = null;
  var last = new Date().getTime();
  var dt = 0;
  var gdt = 0;
  reset();

  function frame() {
    now = new Date().getTime();
    dt = Math.min(1, (now - last) / 1000);

    update(dt);
    render(dt);
    last = now;
    //window.setTimeout(frame, 1000 / 60);
    window.requestAnimationFrame(frame);
  }

  // new entity connected
  socket.on('entity_connected', function(entityData) {
    // get entity here
    var pos = {x:0, y:0, w: entityData.size, h: entityData.size};
    entityList[entityData.id] = new Entity(pos, returnDefaultEntities(entityData.type));
    //console.log("ENTITY CONNECTED");
    //console.log(entityList);
  });

  // existing entity left the game.
  socket.on('entity_disconnected', function(id) {
    delete entityList[id];
  });

  // Your identifier
  socket.on('set_identity', function(id) {
    //console.log(entityList[id]);
    //console.log('set identity id: ' + id);
    var pos = {x:0, y:0, w: entityList[id].pos.w, h: entityList[id].pos.h};
    player = new Player(entityList[id]);
    camera.setEntity(player.entity);

    // Now that we know who we are, let's start playing!
    frame();
  });

  // now get the data
  socket.on('entity_moved', function(entityData) {
    var entity = entityList[entityData.id];
    if (entity) {
      helpers.clamp(entity.pos,world.pos);
      entity.pos.x = entityData.pos.x;
      entity.pos.y = entityData.pos.y;
    }
  });

  // Entity is hidden from view.
  socket.on('entity_hidden', function(id) {
    var entity = entityList[id];
    if (entity) {
      entity.x = 0;
      entity.y = 0;
    }
  });
}

run();
