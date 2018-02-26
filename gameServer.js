var PhysicsWorld = require('./physics.js');
var staticData = require('./gameStaticData');

class GameServer {
    constructor(id, host) {
        // Physics Engine
        this.phys = new PhysicsWorld(this);
        this.rid = id;
        this.playerCount = 0;
        this.host = host;
        this.messages = [];
        this.donuts = {};
        this.bullets = {};

    }

    addDonut(x, y, name, type, id) {
        this.donuts[id] = { x: x, y: y, name: name, type: type, hp: staticData[type].HP, angle: 0, id: id, cdQ: 0 };
        this.phys.addInitialBody(x, y, staticData[type].RADIUS, staticData[type].MASS, 0, id);
        this.playerCount++;
    }

    addBullet(x, y, toX, toY, type, id) {
        this.bullets[id] = { x: x, y: y, toX: toX, toY: toY, type: type, id: id };
        var direction = {
            x: toX - x,
            y: toY - y
        };
        this.phys.addBulletBody(x, y, 25, 0.5, direction, id);
    }

    cleanDonut(pid) {
        delete this.donuts[pid];
        this.phys.removeBody(pid);
        this.playerCount--;
    }

    cleanBullet(pid) {
        delete this.bullets[pid];
        this.phys.removeBody(pid);
    }

    update() {
        // Update physics
        this.phys.nextState();

        // Sync with engine
        for (var key in this.donuts) {
            var body = this.phys.getBody(key);
            if (this.donuts[key] == null) {
                continue;
            }
            this.donuts[key].x = body.position.x;
            this.donuts[key].y = body.position.y;
            this.donuts[key].angle = body.angle;
        }

        for (var key in this.bullets) {
            var body = this.phys.getBody(key);
            if (this.bullets[key] == null) {
                continue;
            }
            this.bullets[key].x = body.position.x;
            this.bullets[key].y = body.position.y;
        }

        // Game logic
        this.applyGameRules();
    }

    // Basic user interruption (Right click)
    move(pid, dir) {
        this.phys.applyForce(pid, dir);
    }

    // Basic user interruption (Mouse move)
    rotate(pid, alpha) {
        this.phys.applyAngularForce(pid, alpha);
    }

    appendMessage(msg) {
        this.messages.push(msg);
    }

    applyGameRules() {
        for (var key in this.donuts) {
            if (this.donuts[key] == null) {
                continue;
            }
            if (this.donuts[key].cdQ > 0) {
                this.donuts[key].cdQ--;
            }
        }
    }

    prepareClientPacketData() {
        var data = {
            gameId: this.rid,
            donuts: this.donuts,
            messages: this.messages,
            bullets: this.bullets
        }
        return data;
    }

    onCollision(event) {
        event.pairs.forEach(pair => {
            if (pair.bodyA.label == "wall") {
                if (pair.bodyB.label == "wall") {
                } else if (pair.bodyB.label in this.bullets) {
                    this.cleanBullet(pair.bodyB.label);
                } else {
                }
            } else if (pair.bodyA.label in this.bullets) {
                if (pair.bodyB.label == "wall") {
                    this.cleanBullet(pair.bodyA.label);
                } else if (pair.bodyB.label in this.bullets) {
                } else {
                }
            } else {
            }
        });
    }
}

module.exports = GameServer;