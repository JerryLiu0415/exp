var PhysicsWorld = require('./physics.js');
var staticData = require('./gameStaticData'); 

class GameServer {
    constructor(id, host) {
        // Physics Engine
        this.phys = new PhysicsWorld();
        this.gameId = id;
        this.playerCount = 0;
        this.host = host;
        this.donuts = {};

    }

    addDonut(x, y, name, type, id) {
        this.donuts[id] = { x: x, y: y, name: name, type: type, hp: staticData[type].HP, angle: 0, id: id };
        this.phys.addPhysicsBody(x, y, staticData[type].RADIUS, staticData[type].MASS, 0, id);
        this.playerCount++;
    }

    cleanDonut(pid) {
        delete this.donuts[pid];
        this.playerCount--;
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

    applyGameRules() {

    }

    prepareClientPacketData() {
        var data = {
            gameId: this.gameId,
            donuts: this.donuts
        }
        return data;
    }
}

module.exports = GameServer;