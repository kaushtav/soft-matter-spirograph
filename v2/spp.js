/// <reference path="./node_modules/@types/p5/global.d.ts" />

class SelfPropelledParticle {
    /**
     * Constructs a self-propelled particle (SPP) that interacts with others and an AP.
     *
     * @param {number} x         – Initial x-position
     * @param {number} y         – Initial y-position
     * @param {number} speed     – Self-propulsion speed (px/unit time)
     * @param {number} strength  – Coupling strength with AP and other SPPs
     * @param {number} radius    – Visual radius (px)
     * @param {number} theta     – Initial orientation angle (radians)
     * @param {number} mobility  – Converts force to velocity (v = μF)
     * @param {number} epsilon   – Repulsion strength (ε)
     * @param {number} timeStep  – Time step (Δt)
     */
    constructor(x, y, speed, strength, radius, theta, mobility, epsilon, timeStep) {
        this.pos = createVector(x, y);         // Position vector
        this.speed = speed;                    // Constant forward speed
        this.theta = theta;                    // Orientation angle (radians)
        this.r = radius;                       // Radius for drawing and repulsion
        this.strength = strength;              // Coupling/alignment strength
        this.mobility = mobility;              // Force-to-velocity conversion
        this.epsilon = epsilon;                // Repulsion strength
        this.timeStep = timeStep;              // Simulation step
        this.cutoff = 3;                       // SPP-SPP interaction cutoff in units of diameter
        this.noiseG = 0.05;                    // Rotational noise factor (g)
        this.totalForce = createVector(0, 0);  // Net force accumulator
        this.mass = 1;                         // For consistency with AP (used in acceleration)
    }

    /**
     * Applies accumulated forces to update position using Euler integration.
     */
    updateFromForce() {
        let dt = this.timeStep;
        let acc = this.totalForce.copy().div(this.mass);   // a = F / m
        let vRep = acc.copy().mult(dt);                    // Velocity from repulsion

        // Self-propulsion component (constant speed in direction theta)
        let vSelf = createVector(
            this.speed * Math.cos(this.theta),
            this.speed * Math.sin(this.theta)
        );

        // Total velocity = self + repulsion
        let netVel = p5.Vector.add(vSelf, vRep);
        this.pos.add(netVel.mult(dt));

        // Keep within canvas
        this.pos.x = constrain(this.pos.x, 0, width);
        this.pos.y = constrain(this.pos.y, 0, height);
    }

    /**
     * Updates orientation based on interaction with AP, other SPPs, and noise.
     * @param {AttractivePoint} ap – Attractive point
     * @param {SelfPropelledParticle[]} allParticles – All other SPPs
     */
    updateOrientation(ap, allParticles) {
        let dt = this.timeStep;

        let dtheta = 0;

        // --------- Attraction to AP ---------
        let vecToAP = p5.Vector.sub(ap.pos, this.pos);
        let phi = vecToAP.heading();  // Direction to AP
        dtheta += ap.strength * Math.sin(phi - this.theta);

        // --------- Alignment with nearby SPPs ---------
        for (let other of allParticles) {
            if (other === this) continue;

            let rij = p5.Vector.sub(other.pos, this.pos);
            let d = rij.mag();

            if (d > 0 && d < this.cutoff * this.r * 2) {
                let phi_ij = rij.heading();
                dtheta += this.strength * Math.sin(phi_ij - this.theta);
            }
        }

        // --------- Rotational noise (Gaussian) ---------
        if (useNoise) {
            dtheta += Math.sqrt(this.noiseG) * randomGaussian();
        }

        // --------- Integrate orientation ---------
        this.theta += dtheta * dt;
    }

    /**
     * Renders the SPP as a blue circle with an optional heading line.
     */
    show() {
        noStroke();
        fill(60, 180, 220);  // Blue
        ellipse(this.pos.x, this.pos.y, this.r * 2);

        // Heading indicator (optional)
        push();
        stroke(255);
        strokeWeight(0.5);
        let dx = this.r * Math.cos(this.theta);
        let dy = this.r * Math.sin(this.theta);
        line(this.pos.x, this.pos.y, this.pos.x + dx, this.pos.y + dy);
        pop();
    }
}
