
// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine
});

// create two boxes and a ground
var boxA = Bodies.circle(100, 100, 20, {force: {x:0.2, y:0.2}, mass: 30}); 
var boxB = Bodies.circle(300, 300, 20, {force: {x:-0.2, y:-0.2}, mass: 30});
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

engine.world.gravity = {x: 0, y: 0, scale: 0.001};
// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, ground]);

console.log(engine.world.bodies);
console.log(engine.world);
// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);