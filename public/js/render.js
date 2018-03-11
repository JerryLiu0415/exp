var CACHE_LIMIT = 10;

class Render {
    constructor(arenaId, playerId, roomId, socket) {
        this.client = socket;
        this.arenaId = arenaId;
        this.$arena = $(arenaId);
        this.$arena.css('width', 1100);
        this.$arena.css('height', 580);
        this.$chat = $('#chat');
        this.roomId = roomId;
        this.playerId = playerId;
        this.donut_renders = {};
        this.bullet_renders = {};
        this.donutData_prev = {};
        this.bulletData_prev = {};

        this.timeStamp_prev = 1;
        this.localDonut = null;
        this.timeOld = 0;

        this.heading = null;
        this.pointing = null;

        this.restartMsgInformed = false;
        this.materialize();
        this.setControls();
    }

    materialize() {
    }

    refresh(data, time) {
        if (data.donuts[this.playerId].cdQ == 0) {
            $('#q').html("Ready!");
            $('#q').css('opacity', '1');
        } else {
            $('#q').html((data.donuts[this.playerId].cdQ / 100).toFixed(1) + "s");
            $('#q').css('opacity', '0.3');
        }
        this.removeZombies(data);
        this.addNewBorns(data);

        // Local donut
        this.localDonut = this.donut_renders[this.playerId];

        // Refresh each donuts
        for (let key in this.donut_renders) {
            this.donut_renders[key].refresh(data.donuts[key]);
        }

        for (let key in this.bullet_renders) {
            this.bullet_renders[key].refresh(data.bullets[key]);
        }

        if (data.freeze && !this.restartMsgInformed) {
            popUpMessage("Prepare for next battle...");
            this.restartMsgInformed = true;
            updateLeaderBoard(data.donuts);
        }
        if (!data.freeze) {
            this.restartMsgInformed = false;
        }

        this.donutData_prev = data.donuts;
        this.bulletData_prev = data.bullets;
    }

    // Remove (.hide) donuts that no longer exists
    removeZombies(data) {
        for (let key in this.donutData_prev) {
            if (data.donuts[key] == null) {
                this.donut_renders[key].remove();
                delete this.donut_renders[key];
            }
        }
        for (let key in this.bulletData_prev) {
            if (data.bullets[key] == null) {
                this.bullet_renders[key].remove();
                delete this.bullet_renders[key];
            }
        }
    }

    // Remove donuts that no longer exists
    addNewBorns(data) {
        for (let key in data.donuts) {
            if (this.donutData_prev[key] == null) {
                this.donut_renders[key] = new Render_Donut(this.arenaId, data.donuts[key]);
            }
        }
        for (let key in data.bullets) {
            if (this.bulletData_prev[key] == null) {
                console.log("add " + key);
                this.bullet_renders[key] = new Render_Bullet(this.arenaId, data.bullets[key]);
            }
        }
    }

    setControls() {
        var self = this;
        $(document).keypress(function (e) {
            var k = e.which;
            switch (k) {
                case 113: //Q
                    self.shootQ();
                    break;
            }

        }).mousemove(function (e) {
            var point = {
                x: event.pageX - self.$arena.offset().left,
                y: event.pageY - self.$arena.offset().top
            };
            self.pointing = point;
            self.rotateBase();
        }).mousedown(function () {
            switch (event.which) {
                case 1:
                    break;
                case 2:
                    break;
                case 3:
                    var head = {
                        x: event.pageX - self.$arena.offset().left,
                        y: event.pageY - self.$arena.offset().top
                    };
                    self.heading = head;
                    var uid = UID();
                    self.$arena.append('<div id="' + uid + '" class="heading" style="left: ' +
                        self.heading.x + 'px; top: ' + self.heading.y + 'px"></div>');
                    $('#' + uid).fadeTo(300, 0.1);
                    setTimeout(function () {
                        $('#' + uid).remove();
                    }, 300);
                    self.move();
                default:
            }
        });
    }

    shootQ() {
        var me = this.localDonut;
        if (me == null || me.donutData.cdQ != 0 || me.donutData.dead) {
            console.log(me.donutData.dead);
            return;
        }
        this.client.emit('shootQ', {
            pid: this.playerId, rid: this.roomId,
            from: { x: me.donutData.x, y: me.donutData.y },
            to: { x: this.pointing.x, y: this.pointing.y }
        });

    }

    move() {
        var me = this.localDonut;
        if (me == null) {
            return;
        }
        var direction = {
            x: this.heading.x - me.donutData.x,
            y: this.heading.y - me.donutData.y
        };
        this.client.emit('move', { pid: this.playerId, rid: this.roomId, dir: direction });
    }

    rotateBase() {
        var me = this.localDonut;
        if (me == null) {
            return;
        }
        var deltaX = this.pointing.x - me.donutData.x;
        var deltaY = this.pointing.y - me.donutData.y;
        var baseAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        baseAngle += 90;

        this.client.emit('rotate', { pid: this.playerId, rid: this.roomId, alpha: baseAngle });
    }
}

function vectorNormalize(v) {
    const dist = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
    return { x: (v.x) / dist, y: (v.y) / dist };
}

function UID() {
    var key1 = Math.floor(Math.random() * 1000).toString();
    var key2 = Math.floor(Math.random() * 1000).toString();
    var key3 = Math.floor(Math.random() * 1000).toString();
    var key4 = Math.floor(Math.random() * 1000).toString();
    return (key1 + key2 + key3 + key4);
}

function popUpMessage(msg) {
    $('body').append('<div id="game-prompt-dead" class="game-prompt-dead"><strong>' + msg + '</strong></div>');
    $('#game-prompt-dead').fadeTo(3000, 0.1);
    setTimeout(function () {
        $('#game-prompt-dead').remove();
    }, 3000);
}

function updateLeaderBoard(donuts) {
    $('#leader-board').empty();
    var sortedPlayers = [];
    for (var key in donuts) {
        sortedPlayers.push(donuts[key]);
    }
    sortedPlayers.sort(function (a, b) {
        return b.kill - a.kill;
    });

    $('#leader-board').empty();
    $('#leader-board').append('<p>Leader Board</p>');
    for (var i = 0; i < sortedPlayers.length; i++) {
        if (i > 4) {
            break;
        }
        $('#leader-board').append('<div class="leader-board-bubble">' + (i + 1)
            + '<img src="img/testbase_' + parseInt(sortedPlayers[i].id) % 4 + '.png"/>' +
            sortedPlayers[i].name + '<div class="leader-board-bubble-score"> Score: ' + sortedPlayers[i].kill +
            ' </div></div>');
    }
}