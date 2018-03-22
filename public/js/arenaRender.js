// Responsible for updating arena related views
class ArenaRender {
    constructor(arenaId, playerId, roomId, socket, data) {
        // Socket where we send user interuptions
        this.client = socket;

        // Arena background 
        this.arenaId = arenaId;
        this.$arena = $(arenaId);
        this.$arena.css('width', NORMAL_ARENA_WIDTH);
        this.$arena.css('height', NORMAL_ARENA_HEIGHT);

        // Chat panel 
        this.$chat = $('#chat');

        // Room id (Game id)
        this.roomId = roomId;

        // Local player id 
        this.playerId = playerId;

        // Donut (main character) renders, indexed pid
        this.donut_renders = {};

        // Bullet (weapon related object) renders, indexed by id
        this.bullet_renders = {};

        // Game data from last frame, for computing delta
        this.data_prev = null;

        // Donut info for local player
        this.localDonutRender = null;

        // A point indicating donut's next moving direction
        this.heading = null;

        // A point indication donut's aiming position
        this.pointing = null;

        this.materialize(data);
        // Game controls
        this.setControls();
    }

    materialize(data) {
        // Add all characters
        for (let key in data.donuts) {
            this.donut_renders[key] = new ArenaDonutRender(this.arenaId, data.donuts[key], key == this.playerId);
        }
        // Add all weapon objects
        for (let key in data.bullets) {
            this.bullet_renders[key] = new ArenaBulletRender(this.arenaId, data.bullets[key]);
        }
        this.data_prev = data;
    }

    /** 
     * Arena view refreshing, called on receiving 'sync' request from server (100Hz)
     * Also refresh all child components
    */
    refresh(data) {
        this.removeDelta(data);
        this.addDelta(data);

        // Keep track of local donut render
        this.localDonutRender = this.donut_renders[this.playerId];

        // Refresh each characters
        for (let key in this.donut_renders) {
            this.donut_renders[key].refresh(data.donuts[key]);
        }

        this.refreshButtons();

        // Refresh each weapon objects
        for (let key in this.bullet_renders) {
            this.bullet_renders[key].refresh(data.bullets[key]);
        }

        // Refresh general scene based on game state
        // Game round transition
        if (!this.data_prev.freeze && data.freeze) {
            popUpMessageGeneral("Prepare for next battle...");
            updateLeaderBoard(data.donuts);
        }

        this.data_prev = data;
    }

    /** 
     * Refresh the UI of each control buttons with server data
    */
    refreshButtons() {
        // Q button. Set opacity and append 'ready' text
        if (this.data_prev.donuts[this.playerId].cdQ != 0 && this.localDonutRender.donutData.cdQ == 0) {
            $('#q').html("Ready!");
            $('#q').css('opacity', '1');
        } else if (this.localDonutRender.donutData.cdQ != 0) {
            $('#q').html((this.localDonutRender.donutData.cdQ / 100).toFixed(1) + "s");
            $('#q').css('opacity', '0.3');
        }

        // W button. Set opacity and append 'ready' text
        if (this.data_prev.donuts[this.playerId].cdW != 0 && this.localDonutRender.donutData.cdW == 0) {
            $('#w').html("Ready!");
            $('#w').css('opacity', '1');
        } else if (this.localDonutRender.donutData.cdW != 0) {
            $('#w').html((this.localDonutRender.donutData.cdW / 100).toFixed(1) + "s");
            $('#w').css('opacity', '0.3');
        }
    }

    // Remove objects that no longer exist in current frame
    removeDelta(data) {
        // Clear zombie characters
        for (let key in this.data_prev.donuts) {
            if (data.donuts[key] == null) {
                this.donut_renders[key].remove();
                delete this.donut_renders[key];
            }
        }
        // Clear zombie weapon objects
        for (let key in this.data_prev.bullets) {
            if (data.bullets[key] == null) {
                this.bullet_renders[key].remove();
                delete this.bullet_renders[key];
            }
        }
    }

    // Add objects that was not there in last frame
    addDelta(data) {
        // Add new characters
        for (let key in data.donuts) {
            if (this.data_prev.donuts[key] == null) {
                this.donut_renders[key] = new ArenaDonutRender(this.arenaId, data.donuts[key], key == this.playerId);
            }
        }
        // Add new weapon objects
        for (let key in data.bullets) {
            if (this.data_prev.bullets[key] == null) {
                this.bullet_renders[key] = new ArenaBulletRender(this.arenaId, data.bullets[key]);
            }
        }
    }

    // Set in game user controls
    setControls() {
        var self = this;
        $(document).keypress(function (e) {
            var k = e.which;
            switch (k) {
                case 113: //Q
                    self.shootQ();
                    break;
                case 119: //W
                    self.shootW();
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

    /**
     * Emit a message to server only if an alive player has cdQ counts to zero
     */
    shootQ() {
        var me = this.localDonutRender;
        if (me == null || me.donutData.cdQ != 0 || me.donutData.dead) {
            return;
        }
        this.client.emit('Q', {
            pid: this.playerId,
            rid: this.roomId,
            from: { x: me.donutData.x, y: me.donutData.y },
            to: { x: this.pointing.x, y: this.pointing.y }
        });
    }

    /**
     * Emit a message to server only if an alive player has cdW counts to zero
     */
    shootW() {
        var me = this.localDonutRender;
        if (me == null || me.donutData.cdW != 0 || me.donutData.dead) {
            return;
        }
        this.client.emit('W', {
            pid: this.playerId,
            rid: this.roomId
        });
    }

    /**
     * Emit a move message to server
     */
    move() {
        var me = this.localDonutRender;
        if (me == null) {
            return;
        }
        var direction = {
            x: this.heading.x - me.donutData.x,
            y: this.heading.y - me.donutData.y
        };
        this.client.emit('move', { pid: this.playerId, rid: this.roomId, dir: direction });
    }


    /**
     * Emit a rotate message to server
     */
    rotateBase() {
        var me = this.localDonutRender;
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
