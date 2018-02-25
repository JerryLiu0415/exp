var Matter = require('./matter.js');

var Engine = Matter.Engine,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies;

class PhysicsWorld {

    constructor() {
        // Create an engine
        this.engine = Engine.create();

        // Static boundaries
        // var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
        this.engine.world.gravity = { x: 0, y: 0, scale: 0.001 };

        var topWall = Bodies.rectangle(500, 0, 1200, 5, { isStatic: true, restitution: 0.5 });
        var leftWall = Bodies.rectangle(-10, 290, 5, 1000, { isStatic: true, restitution: 0.5 });
        var botWall = Bodies.rectangle(500, 580, 1200, 5, { isStatic: true, restitution: 0.5 });
        var rightWall = Bodies.rectangle(1090, 290, 5, 1000, { isStatic: true, restitution: 0.5 });
        World.add(this.engine.world, [botWall, topWall, leftWall, rightWall]);
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

    addPhysicsBody(x, y, r, m, alpha, pid) {
        var toAdd = Bodies.circle(x, y, r, { mass: m, label: pid, force: { x: 0.2, y: 0.2 }, friction: 0, angle: alpha, restitution: 0.5 });
        World.add(this.engine.world, [toAdd]);
    }

    getBody(pid) {
        var body = this.engine.world.bodies.filter(function (b) { return b.label == pid })[0];
        return body;
    }

    nextState() {
        Engine.update(this.engine, 5);
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