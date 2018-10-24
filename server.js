// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var favicon = require('serve-favicon');

app.use(favicon(__dirname + "/favicon/swords.png"));
app.set('port', process.env.PORT || 8080);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

var port = process.env.PORT || 8080;

// Starts the server.
server.listen(port, function() {
  console.log('Starting server on port ' + port);
});

var players = {};

var projectiles = {};
var projectileId = 0;

io.on('connection', function(socket) {
    
  socket.on('new player', function() {
    players[socket.id] = {
        x: 300,
        y: 379,
        color: 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')',
        facing: 'right',
        owner: socket.id
    };
    console.log('players', players)
  });

  socket.on('movement', function(data) {
    var player = players[socket.id] || {};

    if (data.left) {
      if (player.x > 20){
        player.x -= 5;
      }
      player.facing = 'left'
    }
    if (data.up) {
      player.y -= 5;
    }
    if (data.right) {
      if (player.x < 980){
        player.x += 5;
      }
      player.facing = 'right'
    }
    if (data.down) {
      player.y += 5;
    }
    if (data.jump) {
        player.y += 5;
      }
  });


  socket.on('jump', function(data) {
    var player = players[socket.id] || {};
    var steps = 0;
    
    if (!player.currentlyJumping) {
        player.currentlyJumping = true;

        function executeMethod () {
            steps++
    
            if( steps > 15) {
                player.y += 5;
            } else {
                player.y -= 5;
            }
    
            if (steps < 30) {
                setTimeout(executeMethod, 20);
            } else {
                player.currentlyJumping = false;
            }
        }
    
        setTimeout(executeMethod, 20);
    }
    
  });

  socket.on('shoot', function(data) {

    projectiles[projectileId] = {
        owner: socket.id,
        startx: players[socket.id].x,
        endx: players[socket.id].x - 20,
        y: players[socket.id].y,
        direction: players[socket.id].facing
    };

    projectileId += 1
    
  });

  socket.on('deleteProjectile', function(id) {
    delete projectiles[id]    
  });

  socket.on('moveProjectile', function(id) {

    if (projectiles[id] && projectiles[id].direction == 'right') {
        projectiles[id].startx += 20
        projectiles[id].endx += 20
    } else if (projectiles[id]) { //left
        projectiles[id].startx -= 20
        projectiles[id].endx -= 20
    }

  });

    // remove disconnected player
    socket.on('disconnect', function() {
        delete players[socket.id]
    });

    // var lastUpdateTime = (new Date()).getTime();
    // setInterval(function() {
    //     var player = players[socket.id] || {};
    //     // code ...
    //     var currentTime = (new Date()).getTime();
    //     var timeDifference = currentTime - lastUpdateTime;
    //     player.x += 5 * timeDifference;
    //     lastUpdateTime = currentTime;
    // }, 1000 / 60);
});

setInterval(function() {
  io.sockets.emit('state', players, projectiles);
}, 1000 / 60);

io.on('connection', function(socket) {

});
