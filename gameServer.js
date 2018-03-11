var PhysicsWorld = require('./physics.js');
var staticData = require('./gameStaticData');

// Game structure
class GameServer {
    constructor(id, host) {
        this.sockets =
            // Physics Engine
            this.phys = new PhysicsWorld(this);

        // Room id (Sent to user on 'join')
        this.rid = id;

        // Host id
        this.host = host;

        // All chat messages (Sent to user on 'sync')
        this.messages = [];

        // Donut objects, indexed by player id (Sent to user on 'sync')
        this.donuts = {};

        // Bullet objects, indexed by bullet id (Sent to user on 'sync')
        this.bullets = {};

        // Game enters freezing state before players reborn (Sent to user on 'sync')
        this.freeze = false;

        // Game restart cd
        this.restartCd = 0;

        // Game server initialized events
        this.events = [];

    }

    /** 
     * Adding a new donut with its physics body and inital states
     * 
     */
    addDonut(x, y, name, type, id) {
        // Donut indexed by player id
        this.donuts[id] = {
            x: x,
            y: y,
            name: name,
            type: type,
            hp: staticData[type].HP,
            maxHp: staticData[type].HP,
            angle: 0,
            id: id,
            cdQ: 0,
            dead: false,
            kill: 0
        };
        this.phys.addInitialBody(x, y, staticData[type].RADIUS, staticData[type].MASS, 0, id);
    }

    /** 
     * Adding a new bullet with its physics body and inital states
     * 
     */
    addBullet(x, y, toX, toY, type, id) {
        this.bullets[id] = {
            x: x,
            y: y,
            toX: toX,
            toY: toY,
            type: type,
            id: id
        };
        var direction = {
            x: toX - x,
            y: toY - y
        };
        this.phys.addBulletBody(x, y, 25, 0.5, direction, id);
    }

    cleanDonut(pid) {
        delete this.donuts[pid];
        this.phys.removeBody(pid);
    }

    cleanBullet(pid) {
        delete this.bullets[pid];
        this.phys.removeBody(pid);
    }

    /** 
     * Update game state by appling physics and game logic
     * 
     */
    update() {
        // Update physics, get object positions in next 5ms
        this.phys.nextState();

        // Updating game objects (donuts) using the data from physics engine
        // Specifically, the x, y position and body angle
        for (var key in this.donuts) {
            var body = this.phys.getBody(key);
            if (this.donuts[key] == null) {
                continue;
            }
            this.donuts[key].x = body.position.x;
            this.donuts[key].y = body.position.y;
            this.donuts[key].angle = body.angle;
        }

        // Updating game objects (bullets) using the data from physics engine
        // Specifically, the x, y position and body angle
        for (var key in this.bullets) {
            var body = this.phys.getBody(key);
            if (this.bullets[key] == null) {
                continue;
            }
            this.bullets[key].x = body.position.x;
            this.bullets[key].y = body.position.y;
        }

        // Game logic (Not only physics related. e.g dec cd, death, reborn)
        this.applyGameRules();
    }

    // Moving object with id <pid> to direction <dir>
    // Signal the physics engine to apply a constant force
    move(pid, dir) {
        this.phys.applyForce(pid, dir);
    }

    // Rotating object to <alpha>
    // Signal the physics engine to set angle instantly
    rotate(pid, alpha) {
        this.phys.applyAngularForce(pid, alpha);
    }

    // Store <msg> on game server
    appendMessage(msg) {
        this.messages.push(msg);
    }

    /** 
     * Update game state when reach certain conditions
     */
    applyGameRules() {
        var deadCount = 0;

        for (var key in this.donuts) {
            if (this.donuts[key] == null) {
                continue;
            }

            // CD 
            if (this.donuts[key].cdQ > 0) {
                this.donuts[key].cdQ--;
            }

            if (this.freeze) {
                this.restartCd--;
            }

            // Death
            if (this.donuts[key].hp <= 0 && !this.donuts[key].dead) {
                this.donuts[key].dead = true;
                this.donuts[key].x = 1200;
                this.donuts[key].y = 100;
                this.phys.goToHell(key);
            }

            // Counting dead players
            if (this.donuts[key].dead) {
                deadCount++;
            }
        }

        if (!this.freeze && Object.keys(this.donuts).length > 1 && Object.keys(this.donuts).length == deadCount + 1) {
            this.freeze = true;
            this.restartCd = 300;
        }


        // Respawn all players
        if (this.freeze && this.restartCd <= 0) {
            var ind = 0;
            for (var key in this.donuts) {
                this.respawnDonut(key, ind);
                ind++;
            }
            this.freeze = false;
        }
    }

    respawnDonut(pid, index) {
        const respawnPositions = [{ x: 10, y: 10 }, { x: 1000, y: 10 }, { x: 10, y: 10 }, { x: 1000, y: 400 }];
        var body = this.phys.getBody(pid);
        if (this.donuts[pid] == null) {
        }
        this.phys.teleportTo(body, respawnPositions[index % 4].x, respawnPositions[index % 4].y);
        this.phys.rotateTo(body, 0);
        this.donuts[pid].x = body.position.x;
        this.donuts[pid].y = body.position.y;
        this.donuts[pid].angle = body.angle;
        this.donuts[pid].dead = false;
        this.donuts[pid].hp = staticData[this.donuts[pid].type].HP;
    }

    prepareClientPacketData() {
        var data = {
            host: this.host,
            gameId: this.rid,
            donuts: this.donuts,
            messages: this.messages,
            bullets: this.bullets,
            freeze: this.freeze,
            restartCd: this.restartCd,
            events: this.events
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
                } else if (pair.bodyB.label in this.donuts) {
                    this.donuts[pair.bodyB.label].hp--;
                    if (this.donuts[pair.bodyB.label].hp == 0) {
                        console.log(pair.bodyA.label);
                        var attacker = pair.bodyA.label.split("-")[0];
                        console.log(attacker);
                        this.donuts[attacker].kill++;
                    }
                } else {
                }
            } else if (pair.bodyA.label in this.donuts) {
                if (pair.bodyB.label in this.bullets) {
                    this.donuts[pair.bodyA.label].hp--;
                    if (this.donuts[pair.bodyA.label].hp == 0) {
                        console.log(pair.bodyB.label);
                        var attacker = pair.bodyB.label.split("-")[0];
                        console.log(attacker);
                        this.donuts[attacker].kill++;
                    }
                } else {
                }
            } else {
            }
        });
    }

    recordKill(pid) {
        this.donuts[pid].kill++;
    }
}

module.exports = GameServer;