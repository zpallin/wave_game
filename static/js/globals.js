////////////////////////////////////////////////////////////////////////////////
// Global Variables

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var entityMap = {};
var entityLayers = [{}, {}];
var socket = io.connect('/');

//images
var sandImg = new Image();
sandImg.src = '/img/sand.jpg';

var coinImg = new Image();
coinImg.src = '/img/coin.png';
