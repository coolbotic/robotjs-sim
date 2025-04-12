// Example Rapier2D Example Using PixiJS
// https://rapier.rs/docs/user_guides/javascript/getting_started_js
// James Barson - 2025
import { Application, Graphics, Color } from 'pixi.js';
import type * as RAPIER from "@dimforge/rapier2d";

// Optionally add stats.js (install with `npm i stats.js`, also uncomment the lines in the game loop)
// import Stats from 'stats.js';
// let stats = new Stats();
// stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
// stats.dom.style.top = '30px';
// document.body.appendChild( stats.dom );

import('@dimforge/rapier2d').then(async RAPIER => {
  // Use the RAPIER module here.
  let gravity = { x: 0.0, y: -9.81 };
  let world = new RAPIER.World(gravity);

  // Create the ground (Note: hx and hy are half width/height in meters)
  let groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1);
  world.createCollider(groundColliderDesc);

  // Create a dynamic rigid-body.
  let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(0.5, 10.0)
    .setRotation(270.0);
  let rigidBody = world.createRigidBody(rigidBodyDesc);

  // Create a cuboid collider attached to the dynamic rigidBody.
  let colliderDesc = RAPIER.ColliderDesc.cuboid(5, 2);
  world.createCollider(colliderDesc, rigidBody);

  // Create PixiJS scene
  const app = new Application();
  await app.init({ width: window.innerWidth, height: window.innerHeight, backgroundColor: 0xF5F5F7 });
  document.body.appendChild(app.canvas);

  // Define scale meters -> pixels (e.g. 5m = 125px (5m*SCALE))
  const SCALE = 25;

  let cuboid = new Graphics()
    .rect(
      -(5 * SCALE),
      -(2 * SCALE),
      (5 * SCALE) * 2,
      (2 * SCALE) * 2
    )
    .fill(0x000000);

  app.stage.addChild(cuboid);

  let floor = new Graphics()
    .rect(
      -(10.0 * SCALE), // x (top-left)
      -(0.1 * SCALE), // y (top-left)
      (10.0 * SCALE) * 2, // full width
      (0.1 * SCALE) * 2   // full height 
    )
    .fill(0x000000);

  // Set starting position of the floor
  floor.x = (app.canvas.width / 2);
  floor.y = (app.canvas.height / 2);

  app.stage.addChild(floor);

  // Define Debug Graphics
  const debugGraphics = new Graphics();
  app.stage.addChild(debugGraphics);

  // Game loop. Replace by your own game loop system.
  let gameLoop = () => {
    // stats.begin();

    // Step the simulation forward.  
    world.step();

    // Get and print the rigid-body's position.
    let position = rigidBody.translation();
    let rotation = rigidBody.rotation();
    console.log("Rigid-body position: ", position.x, position.y);

    // Set graphics position
    cuboid.rotation = -rotation
    cuboid.x = position.x * SCALE + app.canvas.width / 2;
    cuboid.y = -position.y * SCALE + app.canvas.height / 2;

    // Comment line below to remove debug graphics
    renderDebugShapes(world, debugGraphics, SCALE);

    // stats.end();

    requestAnimationFrame(gameLoop)
    // setTimeout(gameLoop, 16);
  };

  gameLoop();

  function renderDebugShapes(world: RAPIER.World, graphics: Graphics, scale: number) {
    graphics.clear();
    const { vertices, colors } = world.debugRender();
    for (let i = 0; i < vertices.length / 4; i++) {

      let color = new Color({
        r: colors[i * 8] * 255,
        g: colors[i * 8 + 1] * 255,
        b: colors[i * 8 + 2] * 255,
        a: colors[i * 8 + 3]
      });

      graphics.moveTo((vertices[i * 4] * scale) + app.canvas.width / 2, -(vertices[i * 4 + 1] * scale) + app.canvas.height / 2);
      graphics.lineTo((vertices[i * 4 + 2] * scale) + app.canvas.width / 2, -(vertices[i * 4 + 3] * scale) + app.canvas.height / 2);
      graphics.stroke({ color: color, pixelLine: true });
      // graphics.stroke({ color: "red", width: 2 });
    }
  }
})
