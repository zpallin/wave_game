////////////////////////////////////////////////////////////////////////////////
// for registering key strokes

// key static obj
var KEY = {
  A: 65,
  D: 68,
  S: 83,
  W: 87,
  SPACE: 32,
  LEFT: 37,
  RIGHT: 39,
};

// keys manager
function Keys() {
  this.registry = [];
}
Keys.prototype.register = function(reg) {
  this.registry.push({
    keys: reg.keys,
    mode: reg.mode,
    action: reg.action,
  });
}

// adds event listeners that are registered
Keys.prototype.setListeners = function() {
  var registry = this.registry;
  var onkey = function(keyCode, mode) {
		var n, k;
    for(n = 0 ; n < registry.length ; n++) {
      k = registry[n];
      k.mode = k.mode || 'up';
      if ((k.keys && (k.keys.indexOf(keyCode) >= 0))) {
        if (k.mode == mode) {
          k.action.call();
        }
      }
    }
  };

	// add event listeners
  document.addEventListener('keydown', function(ev) { onkey(ev.keyCode, 'down'); }, false);
  document.addEventListener('keyup', function(ev) { onkey(ev.keyCode, 'up'); }, false);
}
