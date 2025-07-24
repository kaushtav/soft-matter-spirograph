// attractivePoint.js

class AttractivePoint {
    /**
     * Creates an Attractive Point (AP) that exerts a coupling force on particles.
     *
     * @param {number} x        – Initial x-coordinate
     * @param {number} y        – Initial y-coordinate
     * @param {number} strength – Coupling strength (K_F in the paper)
     * @param {number} radius   – Radius for visual representation
     */
    constructor(x, y, strength, radius) {
        this.pos = createVector(x, y);            // Position vector
        this.strength = strength;                 // Attraction strength
        this.r = radius;                          // Radius for drawing
        this.vel = createVector(0, 0);            // Velocity vector
        this.mass = 10000;                        // Mass (affects response to forces)
        this.totalForce = createVector(0, 0);     // Net force accumulator
    }

    /**
     * Applies the net force to update velocity and position (Euler integration)
     *
     * @param {number} dt – Time step
     */
    updateFromForce(dt) {
        let acc = this.totalForce.copy().div(this.mass);    // F = ma → a = F/m
        this.vel.add(acc.mult(dt));                          // v += a·dt
        this.pos.add(this.vel.copy().mult(dt));              // x += v·dt

        // Keep the AP within canvas bounds
        this.pos.x = constrain(this.pos.x, 0, width);
        this.pos.y = constrain(this.pos.y, 0, height);

        // Debug logging (optional)
        console.log(acc.x, this.vel.x, this.pos.x);
    }

    /**
     * Renders the AP as a red circle
     */
    show() {
        noStroke();
        fill(255, 60, 60);   // Red
        ellipse(this.pos.x, this.pos.y, this.r * 2);
    }
}
