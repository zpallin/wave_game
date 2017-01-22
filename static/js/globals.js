////////////////////////////////////////////////////////////////////////////////
// Global Variables
var socket = null;
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var entityMap = {};
var entityLayers = [{}, {}];
var assumedEntitySize = 60;
var world, water, fog;

//images
var sandImg = new Image();
sandImg.src = '/img/sand.jpg';

var waterImg = new Image();
waterImg.src = '/img/water.jpg';

var hermitIdleDown = new Image();
hermitIdleDown.src = '/img/hermit_idle_down.png';

var hermitIdleRight = new Image();
hermitIdleRight.src = '/img/hermit_idle_right.png';

var hermitWalkRight = new Image();
hermitWalkRight.src = '/img/hermit_walk_right.png';

var scratchImg = new Image();
scratchImg.src = '/img/scratch.png';

var hermitWalkDown = new Image();
hermitWalkDown.src = '/img/hermit_walk_down.png';

var hermitWalkLeft = new Image();
hermitWalkLeft.src = '/img/hermit_walk_left.png';
