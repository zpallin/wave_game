////////////////////////////////////////////////////////////////////////////////
// Global Variables

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var entityMap = {};
var entityLayers = [{}, {}];
var socket = io.connect('/');
var assumedEntitySize = 60;

//images
var sandImg = new Image();
sandImg.src = '/img/sand.jpg';

var hermitIdleDown = new Image();
hermitIdleDown.src = '/img/hermit_idle_down.png';

var hermitIdleRight = new Image();
hermitIdleRight.src = '/img/hermit_idle_right.png';

var hermitWalkRight = new Image();
hermitWalkRight.src = '/img/hermit_walk_right.png';
