// Ensure Three.js, Cannon.js, and other scripts are loaded first (e.g., via CDN in HTML)

// Get the canvas element
const canvas = document.getElementById('gameCanvas');

// --- Global Variables (for simplicity in this example) ---
let scene, camera, renderer;
let player; // Will hold the Player instance
let physicsWorld; // Will hold the Cannon.js world instance

// For physics simulation timing
const timeStep = 1 / 60; // Target 60 FPS for physics
let lastCallTime = performance.now();


// --- Initialization Functions ---

function initThreeJS() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue background
    scene.fog = new THREE.Fog(0x87ceeb, 0, 75); // Add fog for depth

    // Camera
    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 10); // Positioned to see the player and level
    camera.lookAt(0, 0, 0); // Look towards the center of the scene initially

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; // Enable shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10); // Coming from an angle
    directionalLight.castShadow = true;
    // Configure shadow properties for the light
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);
    
    console.log("Main.js: Three.js initialized (scene, camera, renderer, lights).");
}

function initGame() {
    // Physics World (from physics.js, assumes 'cannonWorld' is globally available)
    if (typeof getWorld === 'function') {
        physicsWorld = getWorld(); // Use the getter from physics.js
    } else if (window.cannonWorld) {
        physicsWorld = window.cannonWorld; // Fallback to global if getter not found
    } else {
        console.error("Main.js: Cannon.js world not found! Ensure physics.js is loaded and initialized before main.js calls initGame.");
        return;
    }
    console.log("Main.js: Cannon.js world obtained.");

    // Load Level (from level.js, assumes 'loadLevel' is globally available)
    if (typeof loadLevel === 'function') {
        loadLevel(scene, physicsWorld); // Pass scene and world
        console.log("Main.js: Level loaded.");
    } else {
        console.error("Main.js: loadLevel function not found! Ensure level.js is loaded before main.js.");
        return;
    }

    // Create Player (from player.js, assumes 'Player' class is globally available)
    const playerInitialPosition = { x: 0, y: 3, z: 3 }; // Start player slightly above platform
    if (typeof Player === 'function') {
        player = new Player(scene, physicsWorld, playerInitialPosition);
        if (player.mesh) {
            player.mesh.castShadow = true;
            player.mesh.receiveShadow = true;
        }
        // Setup collision listener for the player
        player.setupCollisionListener(handleGoalReached);
        console.log("Main.js: Player created and collision listener attached.");
    } else {
        console.error("Main.js: Player class not found! Ensure player.js is loaded before main.js.");
        return;
    }
    
    // Remove the old test cube if it's still there (it was removed in a previous step typically)
    // const oldCube = scene.getObjectByName("testCube"); // Assuming it had a name
    // if (oldCube) scene.remove(oldCube);
}

// Handle window resize
function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    }
}
window.addEventListener('resize', onWindowResize, false);


// --- Game State & Win Condition ---
let gameRunning = true;

function handleGoalReached() {
    if (gameRunning) {
        console.log("You reached the goal! Congratulations!");
        alert("You reached the goal! Congratulations!"); // Simple alert for now
        gameRunning = false; // Stop the game logic

        // Optional: Reset player or level
        // For example, to reset player position:
        // player.body.position.set(playerInitialPosition.x, playerInitialPosition.y, playerInitialPosition.z);
        // player.body.velocity.set(0, 0, 0);
        // player.body.angularVelocity.set(0, 0, 0);
        // gameRunning = true; // If you want to allow continuing
    }
}


// --- Animation Loop ---
function animate() {
    if (!gameRunning) {
        // If game is stopped, could show a message or overlay.
        // For now, just stop requesting new frames indirectly by not running logic.
        // To truly stop, you'd cancelAnimationFrame(animationFrameId);
        // but for this simple case, just not processing updates is enough.
        return; 
    }
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    let deltaTime = (currentTime - lastCallTime) * 0.001; // Convert ms to s
    lastCallTime = currentTime;

    // 1. Step the physics world
    if (physicsWorld) {
        deltaTime = Math.min(deltaTime, 0.1); // Clamp deltaTime
        physicsWorld.step(timeStep, deltaTime, 3); 
    }

    // 2. Handle player inputs and update player physics (only if game is running)
    if (player && gameRunning) {
        player.applyInputs(deltaTime); 
    }

    // 3. Update Three.js meshes based on physics bodies
    if (player) { // Player mesh should update even if game is "won" to show final state
        player.updateMesh();
    }

    // Camera follow logic
    if (player && player.mesh && camera) {
        const targetPosition = player.mesh.position.clone();
        targetPosition.y += 1.0; 
        const offset = new THREE.Vector3(0, 3, 7); 
        let desiredCamPos = player.mesh.position.clone().add(offset);
        camera.position.copy(desiredCamPos); 
        camera.lookAt(targetPosition);
    }

    // 4. Render the Three.js scene
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// --- Start Everything ---
initThreeJS(); 
initGame();    
onWindowResize(); 
animate();     

console.log("Main.js: Initialization complete, starting animation loop.");
