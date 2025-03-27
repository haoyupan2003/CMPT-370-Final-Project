// Physics simulation for dice rolling
class Physics {
    constructor() {
        this.gravity = 9.8; // m/s²
        this.friction = 0.98; // Friction coefficient
        this.restitution = 0.7; // Bounciness
        this.floorY = -2.0; // Y position of the floor
    }

    // Apply physics to a dice object
    update(dice, deltaTime) {
        // Convert deltaTime from ms to seconds
        const dt = deltaTime / 1000;
        
        // Apply gravity
        dice.velocity[1] -= this.gravity * dt;
        
        // Update position based on velocity
        dice.position[0] += dice.velocity[0] * dt;
        dice.position[1] += dice.velocity[1] * dt;
        dice.position[2] += dice.velocity[2] * dt;
        
        // Update rotation based on angular velocity
        const rotX = dice.angularVelocity[0] * dt;
        const rotY = dice.angularVelocity[1] * dt;
        const rotZ = dice.angularVelocity[2] * dt;
        
        // Create rotation matrices for each axis
        const rotMatX = mat4.rotate(mat4.create(), mat4.identity(), rotX, [1, 0, 0]);
        const rotMatY = mat4.rotate(mat4.create(), mat4.identity(), rotY, [0, 1, 0]);
        const rotMatZ = mat4.rotate(mat4.create(), mat4.identity(), rotZ, [0, 0, 1]);
        
        // Combine rotations
        const rotMat = mat4.multiply(mat4.create(), rotMatX, rotMatY);
        mat4.multiply(rotMat, rotMat, rotMatZ);
        
        // Apply to dice rotation matrix
        mat4.multiply(dice.rotation, rotMat, dice.rotation);
        
        // Check for collision with the floor
        if (dice.position[1] - dice.size/2 < this.floorY) {
            // Reposition to be exactly on the floor
            dice.position[1] = this.floorY + dice.size/2;
            
            // Reverse velocity with damping (bounce)
            dice.velocity[1] = -dice.velocity[1] * this.restitution;
            
            // Apply friction to horizontal velocity
            dice.velocity[0] *= this.friction;
            dice.velocity[2] *= this.friction;
            
            // Apply friction to angular velocity
            dice.angularVelocity[0] *= this.friction;
            dice.angularVelocity[1] *= this.friction;
            dice.angularVelocity[2] *= this.friction;
        }
        
        // Check if dice has come to rest
        const velocityMagnitude = Math.sqrt(
            dice.velocity[0] * dice.velocity[0] + 
            dice.velocity[1] * dice.velocity[1] + 
            dice.velocity[2] * dice.velocity[2]
        );
        
        const angularVelocityMagnitude = Math.sqrt(
            dice.angularVelocity[0] * dice.angularVelocity[0] + 
            dice.angularVelocity[1] * dice.angularVelocity[1] + 
            dice.angularVelocity[2] * dice.angularVelocity[2]
        );
        
        // If dice is nearly stopped and near the floor, consider it at rest
        if (velocityMagnitude < 0.1 && angularVelocityMagnitude < 0.1 && 
            Math.abs(dice.position[1] - dice.size/2 - this.floorY) < 0.01) {
            dice.isRolling = false;
            dice.velocity = [0, 0, 0];
            dice.angularVelocity = [0, 0, 0];
            
            // Determine which face is up (will be implemented later)
            dice.result = this.determineDiceResult(dice);
        }
        
        return dice.isRolling;
    }
    
    // Apply initial forces to start a dice roll
    roll(dice) {
        // Reset state
        dice.isRolling = true;
        
        // Apply random initial velocity
        const speed = 2.0 + Math.random() * 3.0;
        const angle = Math.random() * Math.PI * 2;
        
        dice.velocity = [
            speed * Math.cos(angle),
            5.0 + Math.random() * 2.0, // Upward velocity
            speed * Math.sin(angle)
        ];
        
        // Apply random initial angular velocity
        dice.angularVelocity = [
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        ];
        
        return dice;
    }
    
    // Determine which face of the dice is pointing up
    determineDiceResult(dice) {
        // This is a simplified placeholder implementation
        // For a D6 cube, we'll determine which face is most upward
        
        // For now, just return a random result
        // This will be replaced with actual orientation calculation
        switch(dice.type) {
            case 'd4': return Math.floor(Math.random() * 4) + 1;
            case 'd6': return Math.floor(Math.random() * 6) + 1;
            case 'd8': return Math.floor(Math.random() * 8) + 1;
            case 'd10': return Math.floor(Math.random() * 10) + 1;
            case 'd12': return Math.floor(Math.random() * 12) + 1;
            case 'd20': return Math.floor(Math.random() * 20) + 1;
            default: return 1;
        }
    }
}