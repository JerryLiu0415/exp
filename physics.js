var Matter = require('./matter.js');

var Engine = Matter.Engine,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
    Constraint = Matter.Constraint,
    Composite = Matter.Composite,
    Composites = Matter.Composites;

class PhysicsWorld {

    constructor(gameServer) {
        // Create an engine
        this.engine = Engine.create();
        this.collision = [];
        this.gameServer = gameServer;

        // Static boundaries
        // var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
        this.engine.world.gravity = { x: 0, y: 0, scale: 0.001 };

        var topWall = Bodies.rectangle(500, 0, 1150, 5, { isStatic: true, restitution: 0.5, label: "wall" });
        var leftWall = Bodies.rectangle(-10, 290, 5, 600, { isStatic: true, restitution: 0.5, label: "wall" });
        var botWall = Bodies.rectangle(500, 580, 1200, 5, { isStatic: true, restitution: 0.5, label: "wall" });
        var rightWall = Bodies.rectangle(1090, 290, 5, 600, { isStatic: true, restitution: 0.5, label: "wall" });
        World.add(this.engine.world, [botWall, topWall, leftWall, rightWall]);

        var self = this;
        Events.on(this.engine, "collisionStart", function (event) {
            self.gameServer.onCollision(event);
        });
    }

    // Apply force of direction on body, combined with breaking effect
    applyForce(bodyId, dir) {
        var body = this.getBody(bodyId);
        Body.setVelocity(body, { x: 0, y: 0 });
        var f1 = setVectorScale(vectorNormalize(dir), 0.3);
        body.force = f1;
    }

    // Set angle directly
    applyAngularForce(bodyId, alpha) {
        var body = this.getBody(bodyId);
        Body.setAngle(body, alpha);
    }

    addCharacterPhysBody(x, y, r, m, alpha, pid) {
        var toAdd = Bodies.circle(x, y, r, { mass: m, label: pid, force: { x: 0.2, y: 0.2 }, friction: 0, angle: alpha, restitution: 0.5 });
        World.add(this.engine.world, [toAdd]);
    }

    addBulletBody(x, y, r, m, dir, bid) {
        var dirNorm = vectorNormalize(dir);
        // Starting position is shifted 70 pixels away from main body to avoid impulse
        var toAdd = Bodies.circle(x + dirNorm.x * 70, y + dirNorm.y * 70, r, {
            mass: m, label: bid,
            force: setVectorScale(dirNorm, 0.3),
            restitution: 0.5,
            friction: 0.001,
            frictionAir: 0.001
        });
        World.add(this.engine.world, [toAdd]);
    }

    addBulletBody2(x, y, r, m, dir, bid, pid) {
        var dirNorm = vectorNormalize(dir);
        // Starting position is shifted 70 pixels away from main body to avoid impulse
        var toAdd = Bodies.circle(x + dirNorm.x * 170, y + dirNorm.y * 170, r, {
            mass: m, label: bid,
            restitution: 0.5,
            friction: 0.001,
            frictionAir: 0.001
        });

        var body = this.getBody(pid);
        var constraint = Constraint.create({
            bodyA: body,
            bodyB: toAdd,
            stiffness: 0.01
        });
    
        World.add(this.engine.world, [toAdd, constraint]);
    }

    getBody(pid) {
        var body = this.engine.world.bodies.filter(function (b) { return b.label == pid })[0];
        return body;
    }

    removeBody(pid) {
        var body = this.getBody(pid);
        Matter.Composite.remove(this.engine.world, body);
    }

    goToHell(pid) {
        var body = this.getBody(pid);
        this.teleportTo(body, 1200, 100);
    }

    nextState() {
        Engine.update(this.engine, 5);
    }

    teleportTo(body, x, y) {
        Matter.Body.setPosition(body, { x: x, y: y });
    }

    rotateTo(body, alpha) {
        Matter.Body.setAngle(body, alpha);
    }

    appendBody(pid) {
        var body = this.getBody(pid);
        var donutB = Bodies.circle(body.position.x + 50, body.position.y + 50, 20,
            {
                mass: 0.1, force: { x: 0, y: 0 }, angle: 0, restitution: 0.5
            }
        );
        var base = Matter.Composite.create();
        Matter.Composite.add(base, body);
        var compositeBody = Matter.Composite.add(base, donutB);
        var chain = Composites.chain(compositeBody, 0.5, 0, -0.5, 0, { stiffness: 1 });
        World.add(this.engine.world, [chain]);
    }
}

function vectorNormalize(v) {
    const dist = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
    return { x: (v.x) / dist, y: (v.y) / dist };
}

function setVectorScale(v, scale) {
    return { x: (v.x) * scale, y: (v.y) * scale };
}

function addVectors(v1, v2) {
    return { x: (v1.x) + (v2.x), y: (v1.y) + (v2.y) };
}

module.exports = PhysicsWorld;