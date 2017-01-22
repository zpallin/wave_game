////////////////////////////////////////////////////////////////////////////////
// Global Variables

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var entityList = {};
var socket = io.connect('/');

//images
var coinImg = new Image();
coinImg.src = '/img/coin.png';
