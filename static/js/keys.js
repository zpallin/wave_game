////////////////////////////////////////////////////////////////////////////////
// for registering key strokes

function Keys() {
  this.registry = [];
}
Keys.prototype.register = function(keylist, mode, action) {
  this.registry.push({
    keys: keylist,
    mode: mode,
    action: action,
  });
}
// removes existing event listeners
Keys.prototype.removeListeners = function() {
	document.getEventListeners().click.forEach((e)=>{e.remove()});
}
// adds event listeners that are registered
Keys.prototype.setListeners = function() {
	this.removeListeners();
  var onkey = function(keyCode, mode) {
		var n, k;
    for(n = 0 ; n < this.registry.length ; n++) {
      k = this.registry[n];
      k.mode = k.mode || 'up';
      if ((k.key == keyCode) || (k.keys && (k.keys.indexOf(keyCode) >= 0))) {
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
