var CACHE_LIMIT = 10;

class Render {
    constructor(arenaId, playerId, roomId, socket) {
        this.client = socket;
        this.arenaId = arenaId;
        this.$arena = $(arenaId);
        this.$arena.css('width', 1100);
        this.$arena.css('height', 580);
        this.roomId = roomId;
        this.playerId = playerId;
        this.donut_renders = {};
        this.donutData_prev = {};

        this.timeStamp_prev = 1;
        this.localDonut = null;


        this.heading = null;
        this.pointing = null;
        this.materialize();
        this.setControls();
    }

    materialize() {
        this.$arena.append('<div class="room-id"> You are in room: ' + this.roomId + ' </div>');
        this.$arena.append('<div class="arena-ping" id="ping"></div>');
    }

    refresh(data, time) {
        $('#ping').html((new Date().getTime() - time) * 2 + " ms");
        this.removeZombies(data);
        this.addNewBorns(data);
        this.localDonut = this.donut_renders[this.playerId];

        // Refresh each donuts
        for (var key in this.donut_renders) {
            this.donut_renders[key].refresh(data[key]);
        }

        this.donutData_prev = data;
    }

    // Remove (.hide) donuts that no longer exists
    removeZombies(data) {
        for (var key in this.donutData_prev) {
            if (data[key] == null) {
                this.donut_renders[key].remove();
                delete this.donut_renders[key];
            }
        }
    }

    // Remove donuts that no longer exists
    addNewBorns(data) {
        for (var key in data) {
            if (this.donutData_prev[key] == null) {
                this.donut_renders[key] = new Render_Donut(this.arenaId, data[key]);
            }
        }
    }

    setControls() {
        var self = this;
        $(document).mousemove(function (e) {
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
