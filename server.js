var express = require('express');
var app = express();
var PhysicsWorld = require('./physics.js');
var GameServer = require('./gameServer.js');
var INTERVAL = 10;
var connections = 0;
var gameCount = 0;

var staticData = {
	1: { HP: 100 },
	2: { HP: 100 },
	3: { HP: 100 }
};

app.use(express.static(__dirname + '/public'));

var server = app.listen(process.env.PORT || 5004, function () {
	var port = server.address().port;
	console.log('Server running at port %s', port);
});

var io = require('socket.io')(server);
var clientData = {};

// All instances of games stored here
var games = {};

/* Connection events */
io.on('connection', function (client) {
	console.log('User connected');

	client.on('joinGame', function (data) {
		console.log('User connected');
		connections++;
		// Create a new room
		var gameId = data.roomId;
		let pid = UID();
		if (!(data.roomId in games)) {
			console.log('Creating new room...');
			gameId = UID();
			games[gameId] = new GameServer(gameId, pid);
			gameCount++;
		}
		let initX = 0;//getRandomInt(40, 900);
		let initY = 0;//getRandomInt(40, 500);
		let game = games[gameId];
		game.addDonut(initX, initY, data.name, data.type, pid);
		client.emit('joined', { roomId: game.gameId, donutId: pid });
		console.log("User with id " + pid + " has successfully joined room " + game.gameId);
	});

	client.on('move', function (data) {
		var client_game = games[data.rid];
		if (client_game == null) {
			return;
		}
		client_game.move(data.pid, data.dir);
	});

	client.on('rotate', function (data) {
		var client_game = games[data.rid];
		if (client_game == null) {
			return;
		}
		client_game.rotate(data.pid, data.alpha);
	});

	client.on('leaveGame', function (data) {
		console.log(data.donutId + ' has left the game');
		connections--;
		game = games[data.roomId];
		game.cleanDonut(data.donutId);
		if (game.playerCount == 0) {
			delete games[data.roomId];
			gameCount--;
		}
	});
});

// Main loop 
setInterval(function () {
	// Apply physics and Game Logic 
	clientGames = {};
	for (var key in games) {
		games[key].update();
		// Prepare data for client
		clientGames[key] = games[key].prepareClientPacketData();
	}

	clientGames["time"] =  new Date().getTime();

	// Send global games data to each client (Should not)
	io.sockets.emit('sync', clientGames);

}, INTERVAL)

// Status report for debugging
setInterval(function () {
	console.log("Num instances: " + Object.keys(games).length + "  Num connections: " + connections);
}, 5000);

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function UID() {
	var key1 = Math.floor(Math.random() * 1000).toString();
	var key2 = Math.floor(Math.random() * 1000).toString();
	return (key1 + key2);
}

