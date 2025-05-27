// Ensure Cannon.js is loaded before this script (e.g., via CDN in HTML)

// Make the world instance globally accessible for other scripts.
// In a larger application, you might use a module system or a dedicated game state object.
var cannonWorld; // Use 'var' or attach to window for global scope in browsers if not using modules

function initCannon() {
    cannonWorld = new CANNON.World();
    cannonWorld.gravity.set(0, -9.82, 0); // Set gravity (m/s^2)
    cannonWorld.broadphase = new CANNON.NaiveBroadphase(); // Simple broadphase

    // Solver settings - can improve stability and performance
    cannonWorld.solver.iterations = 10; // Number of solver iterations
    // cannonWorld.solver.tolerance = 0.01; // Solver tolerance

    console.log("Cannon.js: World initialized.");

    // Materials (optional for basic setup, but good practice)
// Materials define how objects interact (friction, restitution).
const groundMaterial = new CANNON.Material("groundMaterial");
const sphereMaterial = new CANNON.Material("sphereMaterial");

// Contact material: defines interaction between two specific materials
const groundSphereContactMaterial = new CANNON.ContactMaterial(groundMaterial, sphereMaterial, {
    friction: 0.3, // Frictional force
    restitution: 0.7 // "Bounciness"
});
cannonWorld.addContactMaterial(groundSphereContactMaterial);

// The explicit ground plane is removed from here.
// The 'platform' loaded by level.js will serve as the ground.
// console.log("Cannon.js: Ground plane removed. Level platform will be used.");

// The test sphere is removed from here, as player/objects will be added by other modules.
// console.log("Cannon.js: Test sphere removed. Player/objects will be added separately.");

// The physics loop is removed from here; it will be controlled by main.js.
console.log("Cannon.js: Physics loop removed. Stepping will be handled by main.js.");

}

// Expose a function to get the world instance, though it's also global.
function getWorld() {
    if (!cannonWorld) {
        console.warn("Cannon world not initialized. Call initCannon() first.");
    }
    return cannonWorld;
}

// Initialize Cannon.js physics world automatically when script loads
initCannon();

console.log("physics.js loaded and Cannon world initialized.");
