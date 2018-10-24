var socket = io();

var movement = {
    up: false,
    down: false,
    left: false,
    right: false
  }
  document.addEventListener('keydown', function(event) {

    switch (event.keyCode) {
      case 65: // A
        movement.left = true;
        break;
      case 68: // D
        movement.right = true;
        break;
      case 32: // Spacebar
        socket.emit('jump');
        break;
      case 69: // E
        socket.emit('shoot');
        break;
    }
  });
  document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
      case 65: // A
        movement.left = false;
        break;
      case 68: // D
        movement.right = false;
        break;
    }
  });

socket.emit('new player');
setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);

var canvas = document.getElementById('canvas');
canvas.width = 1000;
canvas.height = 400;
var context = canvas.getContext('2d');
socket.on('state', function(players, projectiles) {
  context.clearRect(0, 0, 1000, 400);
  for (var id in projectiles) {
    if (projectiles[id].startx > 1000 || projectiles[id].startx < 0) {
      socket.emit('deleteProjectile', id)
    } else {
      context.beginPath(); 
      context.lineWidth="5";
      context.strokeStyle="black";
      context.moveTo(projectiles[id].startx, projectiles[id].y);
      context.lineTo(projectiles[id].endx, projectiles[id].y);
      context.stroke(); 
      socket.emit('moveProjectile', id)

    }
  }
  for (var id in players) {
    var player = players[id];
    context.fillStyle = players[id].color;
    context.beginPath();
    context.arc(player.x, player.y, 20, 0, 2 * Math.PI);
    context.fill();
  }
});