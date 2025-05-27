// Depends on three.js (for mesh) and cannon.js (for body)
// Assumes these are loaded globally (e.g., via CDN)

class Player {
    constructor(scene, world, initialPosition = { x: 0, y: 2, z: 0 }) {
        this.scene = scene;
        this.world = world;

        // Player visual representation (Three.js mesh)
        const playerHeight = 2;
        const playerRadius = 0.5;
        // Using a capsule is often good for player characters
        const geometry = new THREE.CapsuleGeometry(playerRadius, playerHeight - (2 * playerRadius), 8, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red color
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
        this.scene.add(this.mesh);
        console.log("Player: Three.js mesh (capsule) created and added to scene.");

        // Player physical body (Cannon.js body)
        // Using a sphere for the physics body to allow rolling.
        const bodyShape = new CANNON.Sphere(playerRadius); 
        this.body = new CANNON.Body({
            mass: 70, // kg
            position: new CANNON.Vec3(initialPosition.x, initialPosition.y, initialPosition.z),
            shape: bodyShape,
            material: new CANNON.Material("playerMaterial"), // Define interactions later
            linearDamping: 0.1, // Helps simulate air resistance / friction
            angularDamping: 0.5  // Helps simulate rolling friction and prevent infinite rolling
        });
        this.world.addBody(this.body);
        console.log("Player: Cannon.js body (sphere) created and added to world.");

        // Movement parameters
        this.moveSpeed = 200; // Adjusted force strength for rolling
        this.jumpForce = 350; // Keep jump force the same for now

        // Callback for goal collision
        this.onGoalReached = null; 

        // Placeholder for input state
        this.input = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        };

        // Placeholder for input state
        this.input = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        };

        // Bind methods to 'this' and store them for add/removeEventListener
        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
        this.boundHandleKeyUp = this.handleKeyUp.bind(this);

        // Setup input handling
        this.setupInputListeners();
    }

    setupInputListeners() {
        document.addEventListener('keydown', this.boundHandleKeyDown);
        document.addEventListener('keyup', this.boundHandleKeyUp);
        console.log("Player: Input listeners attached.");
    }

    disposeInputListeners() { // Optional: for cleanup if player is removed
        document.removeEventListener('keydown', this.boundHandleKeyDown);
        document.removeEventListener('keyup', this.boundHandleKeyUp);
        console.log("Player: Input listeners removed.");
    }

    // Movement methods (apply forces/impulses)
    // dt (delta time) is important for frame-rate independent physics
    applyInputs(dt) {
        // Forces are applied in world space.
        // For camera-relative controls, you'd transform these by camera orientation.
        const force = new CANNON.Vec3(0, 0, 0);
        const impulseScale = this.moveSpeed; // Use moveSpeed as a base for impulse magnitude

        if (this.input.forward) {
            force.z -= impulseScale;
        }
        if (this.input.backward) {
            force.z += impulseScale;
        }
        if (this.input.left) {
            force.x -= impulseScale;
        }
        if (this.input.right) {
            force.x += impulseScale;
        }

        // Apply force directly to the center of the sphere.
        // This will cause it to slide and roll due to friction with the ground.
        if (this.input.forward || this.input.backward || this.input.left || this.input.right) {
             this.body.applyForce(force.scale(dt), this.body.position); // Scale by dt for frame independence
        }

        if (this.input.jump) {
            // Simple ground check: check if y-velocity is very small.
            // A more robust check involves raycasting downwards or checking collision contact normals.
            if (Math.abs(this.body.velocity.y) < 0.5) {
                this.body.applyImpulse(new CANNON.Vec3(0, this.jumpForce, 0), this.body.position);
                console.log("Player: Jumping (applying impulse)");
            }
            this.input.jump = false; // Consume jump input
        }
    }

    // Method to update the Three.js mesh position based on the Cannon.js body
    updateMesh() {
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }

    // Handling key down events
    handleKeyDown(event) {
        switch(event.key.toLowerCase()) {
            case 'w': case 'arrowup': this.input.forward = true; break;
            case 's': case 'arrowdown': this.input.backward = true; break;
            case 'a': case 'arrowleft': this.input.left = true; break;
            case 'd': case 'arrowright': this.input.right = true; break;
            case ' ': this.input.jump = true; break; 
        }
    }

    // Handling key up events
    handleKeyUp(event) {
        switch(event.key.toLowerCase()) {
            case 'w': case 'arrowup': this.input.forward = false; break;
            case 's': case 'arrowdown': this.input.backward = false; break;
            case 'a': case 'arrowleft': this.input.left = false; break;
            case 'd': case 'arrowright': this.input.right = false; break;
        }
    }

    // Collision handling
    setupCollisionListener(goalReachedCallback) {
        this.onGoalReached = goalReachedCallback;
        this.body.addEventListener("collide", (event) => {
            // Check if the collision involves the goal
            // The 'event.body' is the OTHER body involved in the collision
            if (event.body.userData && event.body.userData.isGoal) {
                if (this.onGoalReached) {
                    this.onGoalReached();
                }
            }
        });
        console.log("Player: Collision listener setup.");
    }
}

// Example of how it might be instantiated in main.js (or game.js)
// This file only defines the Player class.
// Instantiation would happen elsewhere after scene and world are created.
// e.g., const player = new Player(threeScene, cannonWorld);
// And then in the animation loop:
// player.applyInputs(deltaTime);
// player.updateMesh();

console.log("player.js loaded. Defines Player class.");
