var express = require('express');
var app = express();
var PhysicsWorld = require('./physics.js');
var GameServer = require('./gameServer.js');
var INTERVAL = 10;

app.use(express.static(__dirname + '/public'));

var server = app.listen(process.env.PORT || 5004, function () {
	var port = server.address().port;
	console.log('Server running at port %s', port);
});

var io = require('socket.io')(server);

// All client sockets stored here, indexed by room id
var clients = {};

// All instances of games stored here, indexed by room id
var games = {};

/* Connection events */
io.on('connection', function (client) {
	console.log('User connected');

	/**
	 *  Client will send the character position and mouse position to this route
	 *  
	 *  Client data structure {name: ..., rid: ..., type: ... }
	 */
	client.on('joinGame', function (data) {
		console.log('User connected');
		// Create a new room
		var rid = data.rid;
		let pid = UID();
		if (!(data.rid in games)) {
			// Room id doesn't exist
			console.log('Creating new room...');
			rid = UID();
			games[rid] = new GameServer(rid, pid);
			clients[rid] = [];
		}
		let initX = 10; //getRandomInt(40, 900);
		let initY = 10; //getRandomInt(40, 500);
		let game = games[rid];
		game.addDonut(initX, initY, data.name, data.type, pid);
		clients[rid].push(client);
		client.emit('joined', { rid: game.rid, pid: pid, initData: game.prepareClientPacketData() });
		console.log("User with id " + pid + " has successfully joined room " + game.rid);
	});

	/**
	 *  This route handles cases when player is casting Q ability 
	 *  Client will send the character position and mouse position to this route
	 *  
	 *  Client data structure {pid: ..., from: { x: ..., y: ... }, to: { x: ..., y: ... } }
	 */
	client.on('shootQ', function (data) {
		var client_game = games[data.rid];
		if (client_game == null) {
			return;
		}
		var bid = data.pid + '-B-' + UID();
		client_game.addBullet(data.from.x, data.from.y, data.to.x, data.to.y, 1, bid);
		if (client_game.donuts[data.pid] == null) {
			return;
		}
		client_game.donuts[data.pid].cdQ = 100;
	});


	/**
	 *  Client will send the move signal along with expected heading point
	 * 
	 *  Client data structure { pid: ..., rid: ..., dir: ...}
	 */
	client.on('move', function (data) {
		var client_game = games[data.rid];
		if (client_game == null) {
			return;
		}
		client_game.move(data.pid, data.dir);
	});

	/**
	 *  Client will send the updated body rotation angle to this route
	 * 
	 *  Client data structure { pid: ..., rid: ..., alpha: ...}
	 */
	client.on('rotate', function (data) {
		var client_game = games[data.rid];
		if (client_game == null) {
			return;
		}
		client_game.rotate(data.pid, data.alpha);
	});

	/**
	 *  Client will send the msg content along with his room number to this route
	 *  Historical messages for each game (room) are stored at gameServer
	 * 
	 *  Client data structure { content: ..., rid: ...}
	 */
	client.on('message', function (data) {
		var client_game = games[data.rid];
		if (client_game == null) {
			return;
		}
		client_game.appendMessage(data.content);
		clients[data.rid].forEach(element => { element.emit('message', client_game.messages) });
	});

	/**
	 *  Client will send the room id and player id to this route upon closing tab
	 * 
	 *  Client data structure { rid: ..., pid: ... }
	 */
	client.on('leave', function (data) {
		console.log(data.pid + ' has left the game');
		var game = games[data.rid];
		if (game == null) {
			return;
		}
		// Remove player from gameServer data
		game.cleanDonut(data.pid);

		// Remove player from sockets dictionary
		var index = clients[data.rid].indexOf(client);
		if (index > -1) {
			clients[data.rid].splice(index, 1);
		}

		// Remove the game if the room is empty
		if (game.playerCount == 0) {
			console.log('Room ' + data.rid + ' has been removed');
			delete games[data.rid];
			delete clients[data.rid];
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

	clientGames["time"] = new Date().getTime();

	// Send global games data to each client (Should not)
	io.sockets.emit('sync', clientGames);

}, INTERVAL)

// Status report for debugging
setInterval(function () {
	console.log("All game instances");
	for (var key in games) {
		console.log("  - Game: " + games[key].rid + " has "
			+ Object.keys(games[key].donuts).length + " player(s)");
	}
}, 5000);

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function UID() {
	var key1 = Math.floor(Math.random() * 1000).toString();
	var key2 = Math.floor(Math.random() * 1000).toString();
	return (key1 + key2);
}

