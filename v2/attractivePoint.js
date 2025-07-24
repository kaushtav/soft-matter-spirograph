// attractivePoint.js

class AttractivePoint {
    /**
     * @param {number} x        – x‐coordinate of the AP
     * @param {number} y        – y‐coordinate of the AP
     * @param {number} strength – coupling strength (K_F in the paper)
     * @param radius
     */
    constructor(x, y, strength, radius) {
        this.pos = createVector(x,y);
        this.strength = strength;
        this.r = radius; // for drawing
        this.vel = createVector(0, 0);
        this.mass = 1000;// 💡 new
    }
    applyForcesFrom(spps, epsilon, cutoff, timeStep) {
        let totalForce = createVector(0, 0);
        let diameter = this.r * 2;
        let cutoffDist = cutoff * diameter;

        for (let p of spps) {
            let rij = p5.Vector.sub(this.pos, p.pos);
            let d = rij.mag();
            if (d > 0 && d < cutoffDist) {
                let s12 = pow(diameter, 12);
                let d13 = pow(d, 13);
                let mag = 12 * epsilon * (s12 / d13);
                let force = rij.copy().normalize().mult(mag);
                totalForce.add(force);
            }
        }

        // Basic motion update
        let accel = totalForce.div(this.mass);  // mass = 1, so it's just force
        this.vel.add(accel.mult(timeStep));
        this.pos.add(this.vel.copy().mult(timeStep));

        // Optional: constrain within canvas
        this.pos.x = constrain(this.pos.x, 0, width);
        this.pos.y = constrain(this.pos.y, 0, height);
    }

    show() {
        noStroke();
        fill(255, 60, 60);
        ellipse(this.pos.x, this.pos.y, this.r * 2);
    }
}
