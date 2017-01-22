////////////////////////////////////////////////////////////////////////////////
// helpers

var helpers = {
  clamp: function(obj, bound) {
    var xside = obj.w / 2;
    var yside = obj.h / 2;

    if (obj.x - xside < bound.x) {
      obj.x = bound.x + xside;
    }

    if (obj.y - yside < bound.y) {
      obj.y = bound.y + yside;
    }

    if (obj.x + xside > bound.x + bound.w) {
      obj.x = bound.x + bound.w - yside;
    }

    if (obj.y + yside > bound.y + bound.h) {
      obj.y = bound.y + bound.h - yside;
    }
  },

  randomStr: function()
  {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ ) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }
}
