var DEBUG = true;
var INTERVAL = 20;
var ROTATION_SPEED = 5;
var ARENA_MARGIN = 30;

function Game(arenaId, w, h, socket) {
	this.tanks = []; //Tanks (other than the local tank)
	this.balls = [];
	this.width = w;
	this.height = h;
	this.$arena = $(arenaId);
	this.$arena.css('width', w);
	this.$arena.css('height', h);
	this.socket = socket;

	var g = this;
	setInterval(function () {
		g.mainLoop();
	}, INTERVAL);
}

Game.prototype = {

	addTank: function (id, name, type, isLocal, x, y, hp) {
		var t = new Tank(id, name, type, this.$arena, this, isLocal, x, y, hp);
		if (isLocal) {
			this.localTank = t;
		} else {
			this.tanks.push(t);
		}
	},

	removeTank: function (tankId) {
		//Remove tank object
		this.tanks = this.tanks.filter(function (t) { return t.id != tankId });
		//remove tank from dom
		$('#' + tankId).remove();
		$('#info-' + tankId).remove();
	},

	killTank: function (tank) {
		tank.dead = true;
		this.removeTank(tank.id);
		//place explosion
		this.$arena.append('<img id="expl' + tank.id + '" class="explosion" src="./img/explosion.gif">');
		$('#expl' + tank.id).css('left', (tank.x - 50) + 'px');
		$('#expl' + tank.id).css('top', (tank.y - 100) + 'px');

		setTimeout(function () {
			$('#expl' + tank.id).remove();
		}, 1000);

	},

	mainLoop: function () {
		if (this.localTank != undefined) {
			//send data to server about local tank
			this.sendData();
			//move local tank
			this.localTank.move();
		}
	},

	sendData: function () {
		//Send local data to server
		var gameData = {};

		//Send tank data
		var t = {
			id: this.localTank.id,
			x: this.localTank.x,
			y: this.localTank.y,
			baseAngle: this.localTank.baseAngle,
			cannonAngle: this.localTank.cannonAngle
		};
		gameData.tank = t;
		//Client game does not send any info about balls,
		//the server controls that part
		this.socket.emit('sync', gameData);
	},

	receiveData: function (serverData) {
		var game = this;

		serverData.tanks.forEach(function (serverTank) {

			//Update local tank stats
			if (game.localTank !== undefined && serverTank.id == game.localTank.id) {
				game.localTank.hp = serverTank.hp;
				if (game.localTank.hp <= 0) {
					game.killTank(game.localTank);
				}
			}

			//Update foreign tanks
			var found = false;
			game.tanks.forEach(function (clientTank) {
				//update foreign tanks
				if (clientTank.id === serverTank.id) {
					clientTank.x = serverTank.x;
					clientTank.y = serverTank.y;
					clientTank.baseAngle = serverTank.baseAngle;
					clientTank.cannonAngle = serverTank.cannonAngle;
					clientTank.hp = serverTank.hp;
					if (clientTank.hp <= 0) {
						game.killTank(clientTank);
					}
					clientTank.refresh();
					found = true;
				}
			});
			if (!found &&
				(game.localTank == undefined || serverTank.id != game.localTank.id)) {
				//I need to create it
				game.addTank(serverTank.id, serverTank.name, serverTank.type, false, serverTank.x, serverTank.y, serverTank.hp);
			}
		});

		//Render balls
		game.$arena.find('.cannon-ball').remove();

		serverData.balls.forEach(function (serverBall) {
			var b = new Ball(serverBall.id, serverBall.ownerId, game.$arena, serverBall.x, serverBall.y);
			b.exploding = serverBall.exploding;
			if (b.exploding) {
				b.explode();
			}
		});
	}
}

function Ball(id, ownerId, $arena, x, y) {
	this.id = id;
	this.ownerId = ownerId;
	this.$arena = $arena;
	this.x = x;
	this.y = y;

	this.materialize();
}

Ball.prototype = {

	materialize: function () {
		this.$arena.append('<div id="' + this.id + '" class="cannon-ball" style="left:' + this.x + 'px"></div>');
		this.$body = $('#' + this.id);
		this.$body.css('left', this.x + 'px');
		this.$body.css('top', this.y + 'px');
	},

	explode: function () {
		this.$arena.append('<div id="expl' + this.id + '" class="ball-explosion" style="left:' + this.x + 'px"></div>');
		var $expl = $('#expl' + this.id);
		$expl.css('left', this.x + 'px');
		$expl.css('top', this.y + 'px');
		setTimeout(function () {
			$expl.addClass('expand');
		}, 1);
		setTimeout(function () {
			$expl.remove();
		}, 1000);
	}

}

function Tank(id, name, type, $arena, game, isLocal, x, y, hp) {
	this.id = id;
	this.name = name;
	this.type = type;
	this.speed = 5;
	this.$arena = $arena;
	this.baseAngle = getRandomInt(0, 360);
	//Make multiple of rotation amount
	this.baseAngle -= (this.baseAngle % ROTATION_SPEED);
	this.cannonAngle = 0;
	this.x = x;
	this.y = y;
	this.mx = null;
	this.my = null;
	this.dir = {
		up: false,
		down: false,
		left: false,
		right: false
	};
	this.heading = null;
	this.game = game;
	this.isLocal = isLocal;
	this.hp = hp;
	this.dead = false;

	this.materialize();
}

Tank.prototype = {

	materialize: function () {
		this.$arena.append('<img id='+ this.id + ' class="tank" src="img/testbase.png">');
		this.$body = $('#' + this.id);

		this.$body.css('-webkit-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		this.$body.css('-moz-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		this.$body.css('-o-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		this.$body.css('transform', 'rotateZ(' + this.baseAngle + 'deg)');

		this.$arena.append('<div id="info-' + this.id + '" class="info"></div>');
		this.$info = $('#info-' + this.id);
		this.$info.append('<div class="label">' + this.name + '</div>');
		this.$info.append('<div class="hp-boarder"><div class="hp-bar"></div></div>');

		this.refresh();

		if (this.isLocal) {
			this.setControls();
		}
	},

	isMoving: function () {
		return this.heading != null;
	},

	refresh: function () {
		this.$body.css('left', this.x - 40 + 'px');
		this.$body.css('top', this.y - 40 + 'px');
		this.$body.css('-webkit-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		this.$body.css('-moz-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		this.$body.css('-o-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		this.$body.css('transform', 'rotateZ(' + this.baseAngle + 'deg)');

		this.$info.css('left', (this.x) + 'px');
		this.$info.css('top', (this.y) + 'px');
		if (this.isMoving()) {
			this.$info.addClass('fade');
		} else {
			this.$info.removeClass('fade');
		}

		this.$info.find('.hp-bar').css('width', this.hp + 'px');
		this.$info.find('.hp-bar').css('background-color', getGreenToRed(this.hp));
	},

	setControls: function () {
		var t = this;

		/* Detect both keypress and keyup to allow multiple keys
		 and combined directions */
		$(document).keypress(function (e) {
			var k = e.which;
			switch (k) {
				case 113: //Q
					t.shoot();
					break;
			}

		}).mousemove(function (e) { //Detect mouse for aiming
			t.mx = e.pageX - t.$arena.offset().left;
			t.my = e.pageY - t.$arena.offset().top;
			t.rotateBase();
		}).mousedown(function () {
			switch (event.which) {
				case 1:
					break;
				case 2:
					break;
				case 3:
					t.heading = {
						x: event.pageX - t.$arena.offset().left,
						y: event.pageY - t.$arena.offset().top
					};

					var uuid = Math.floor(Math.random(100) * 100);
					t.$arena.append('<div id="' + uuid + '" class="heading" style="left: ' + t.heading.x + 'px; top: ' + t.heading.y + 'px"></div>');

					$('#' + uuid).fadeTo(300, 0.1);
					setTimeout(function () {
						$('#' + uuid).remove();
					}, 300);
				default:
			}
		});

	},

	move: function () {
		if (this.dead) {
			return;
		}

		if (this.heading != null) {
			const deltaX = this.heading.x - this.x;
			const deltaY = this.heading.y - this.y;
			const dist = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
			var moveX = deltaX / dist;
			var moveY = deltaY / dist;

			moveX = this.speed * moveX;
			moveY = this.speed * moveY;

			this.updateHeading(dist);

			if (this.x + moveX > (0 + ARENA_MARGIN) && (this.x + moveX) < (this.$arena.width() - ARENA_MARGIN)) {
				this.x += moveX;
			}
			if (this.y + moveY > (0 + ARENA_MARGIN) && (this.y + moveY) < (this.$arena.height() - ARENA_MARGIN)) {
				this.y += moveY;
			}
		}
		this.refresh();
	},

	rotateBase: function () {
		var tank = { x: this.x, y: this.y };
		var deltaX = this.mx - tank.x;
		var deltaY = this.my - tank.y;
		this.baseAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
		this.baseAngle += 90;
	},

	shoot: function () {
		if (this.dead) {
			return;
		}

		//Emit ball to server
		var serverBall = {};
		//Just for local balls who have owner
		serverBall.alpha = this.baseAngle * Math.PI / 180; //angle of shot in radians
		//Set init position
		var cannonLength = 60;
		var deltaX = cannonLength * Math.sin(serverBall.alpha);
		var deltaY = cannonLength * Math.cos(serverBall.alpha);

		serverBall.ownerId = this.id;
		serverBall.x = this.x + deltaX - 5;
		serverBall.y = this.y - deltaY - 5;

		this.game.socket.emit('shoot', serverBall);
	},

	updateHeading: function (dist) {
		if (this.heading != null) {
			if (dist < this.speed) {
				this.heading = null;
			}
		}
	}

}

function debug(msg) {
	if (DEBUG) {
		console.log(msg);
	}
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function getGreenToRed(percent) {
	r = percent < 50 ? 255 : Math.floor(255 - (percent * 2 - 100) * 255 / 100);
	g = percent > 50 ? 255 : Math.floor((percent * 2) * 255 / 100);
	return 'rgb(' + r + ',' + g + ',0)';
}
