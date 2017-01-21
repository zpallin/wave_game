var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var keys = new Keys();
var coinImg = new Image();
coinImg.src = '/img/coin.png';
var colorTest = new RenderColor(ctx, 40, 40, ['#00ff00', '#00dd00', '#00bb00']);
var animTest = new RenderAnim(ctx, 44, 44, coinImg);

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  colorTest.rectLoop(canvas.width / 2, canvas.height / 2); 
  animTest.anim(0, 0);
}

function update() {

}

function reset() {
    
}

function run() {
  var now = null;
  var last = new Date().getTime();
  reset();

  function frame() {
    now = new Date().getTime();
    update();
    render();
    last = now;
    window.setTimeout(frame, 1000 / 60);
  }

  frame();
}

run();
