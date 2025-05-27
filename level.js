// Depends on three.js and cannon.js
// Assumes these are loaded globally

const levelObjects = {
    platform: null,
    goal: null
};

/**
 * Loads a simple level into the Three.js scene and Cannon.js world.
 * The level consists of a platform and a goal area.
 * @param {THREE.Scene} scene - The Three.js scene to add visual elements to.
 * @param {CANNON.World} world - The Cannon.js world to add physical bodies to.
 */
function loadLevel(scene, world) {
    console.log("level.js: Loading level...");

    // --- Platform ---
    // Visual (Three.js)
    const platformGeometry = new THREE.BoxGeometry(10, 0.5, 10); // width, height, depth
    const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 }); // Grey
    const platformMesh = new THREE.Mesh(platformGeometry, platformMaterial);
    platformMesh.position.set(0, -0.25, 0); // Position it so its top is at y=0
    platformMesh.castShadow = true; // Allow platform to cast shadows
    platformMesh.receiveShadow = true; // Allow platform to receive shadows
    scene.add(platformMesh);
    console.log("Level: Platform mesh created and added to scene.");

    // Physical (Cannon.js)
    const platformShape = new CANNON.Box(new CANNON.Vec3(5, 0.25, 5)); // Half-extents
    const platformBody = new CANNON.Body({
        mass: 0, // Static body
        shape: platformShape,
        position: new CANNON.Vec3(0, -0.25, 0),
        material: new CANNON.Material("groundMaterial") // Use existing or define new
    });
    world.addBody(platformBody);
    console.log("Level: Platform body created and added to world.");
    levelObjects.platform = { mesh: platformMesh, body: platformBody };


    // --- Goal ---
    // Visual (Three.js)
    const goalSize = 1;
    const goalGeometry = new THREE.BoxGeometry(goalSize, goalSize, goalSize);
    const goalMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 }); // Green, semi-transparent
    const goalMesh = new THREE.Mesh(goalGeometry, goalMaterial);
    goalMesh.position.set(4, goalSize / 2, 4); // Position it on the platform
    goalMesh.castShadow = true;
    scene.add(goalMesh);
    console.log("Level: Goal mesh created and added to scene.");

    // Physical (Cannon.js)
    // This body will act as a sensor. It won't physically block the player,
    // but collisions with it can be detected.
    const goalShape = new CANNON.Box(new CANNON.Vec3(goalSize / 2, goalSize / 2, goalSize / 2));
    const goalBody = new CANNON.Body({
        mass: 0, // Static
        shape: goalShape,
        position: new CANNON.Vec3(4, goalSize / 2, 4),
        isTrigger: true // Mark as a trigger (sensor)
    });
    goalBody.userData = { isGoal: true, name: "GoalArea" }; // Identify goal
    // Note: For triggers to work, you typically need to listen for 'collide' events
    // on the player's body and check if the other body is the goalBody.
    // Example: playerBody.addEventListener("collide", function(event){
    // if(event.body === levelObjects.goal.body){ console.log("Goal reached!"); }
    // });
    world.addBody(goalBody);
    console.log("Level: Goal body (trigger) created and added to world.");
    levelObjects.goal = { mesh: goalMesh, body: goalBody };

    console.log("level.js: Level loading complete.");
    return levelObjects; // Return references if needed elsewhere
}

// Make the function globally accessible or export it if using modules
// window.loadLevel = loadLevel;

console.log("level.js loaded. Defines loadLevel() function.");
