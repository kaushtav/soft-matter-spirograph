/// <reference path="./node_modules/@types/p5/global.d.ts" />

class SelfPropelledParticle {
    /**
     * @param {number} x         – initial x position
     * @param {number} y         – initial y position
     * @param {number} speed     – self‐propulsion speed (units: px / unit time)
     * @param {number} radius    – visual radius (px)
     * @param {number} theta     – initial orientation angle (rad)
     * @param {number} mobility  – mobility (m), converts force → velocity
     * @param {number} epsilon   – repulsion strength (ε)
     * @param {number} timeStep  – time step Δt (we keep it at 0.1)
     */
    constructor(x, y, speed, radius, theta, mobility, epsilon, timeStep) {
        this.pos = createVector(x, y);
        this.speed = speed;
        this.r = radius;        // helps define s = 2r in repulsion
        this.theta = theta;
        this.mobility = mobility;
        this.epsilon = epsilon;
        this.cutoff = 3;        // cutoff factor (in units of diameter); we’ll do d < 3s
        this.timeStep = timeStep;
        this.noiseG = 0.1;      // rotational‐noise strength (√g) when useNoise = true
    }

    /**
     * Update orientation + position over one step Δt.
     * – ap: the AttractivePoint
     * – allParticles: array of all SPPs (used for repulsion if we uncomment it)
     */
    update(ap, allParticles) {
        let dt = this.timeStep;

        // 1) Compute total repulsive force:
        let totalRep = createVector(0, 0);
        let diameter = this.r * 2;
        let cutoffDist = this.cutoff * diameter; // e.g. 3·s

        // --- 1a) Pairwise SPP ↔ SPP repulsion (kept commented) ---
        /*
        for (let other of allParticles) {
          if (other === this) continue;
          let rij = p5.Vector.sub(this.pos, other.pos);
          let d = rij.mag();
          if (d > 0 && d < cutoffDist) {
            let s12 = pow(diameter, 12);
            let d13 = pow(d, 13);
            let rawMag = 12 * this.epsilon * (s12 / d13);
            let fret = rij.copy().normalize().mult(rawMag);
            totalRep.add(fret);
          }
        }
        */

        // --- 1b) Excluded-volume repulsion SPP ↔ AP ---
        let rap = p5.Vector.sub(this.pos, ap.pos);
        let dap = rap.mag();
        if (dap > 0 && dap < cutoffDist) {
            let s12 = pow(diameter, 12);
            let d13 = pow(dap, 13);
            let rawMagAP = 12 * this.epsilon * (s12 / d13);
            let fretAP = rap.copy().normalize().mult(rawMagAP);
            totalRep.add(fretAP);
        }

        // 2) Orientation update: “align to AP” + optional rotational noise
        let rawVec = p5.Vector.sub(ap.pos, this.pos);
        let phi = rawVec.heading();           // bearing from SPP → AP

        // Deterministic alignment term: dθ_det = K_F · sin(φ − θ)
        let dtheta = ap.strength * sin(phi - this.theta);

        // If noise is enabled, add rotational noise √g·Z_i:
        if (useNoise) {
            let dthetaNoise = sqrt(this.noiseG) * randomGaussian();
            dtheta += dthetaNoise;
        }

        // Integrate θ over dt:
        this.theta += dtheta * dt;

        // 3) Compute net velocity = v_self + v_rep
        let vSelf = createVector(
            this.speed * cos(this.theta),
            this.speed * sin(this.theta)
        );
        let vRep = totalRep.mult(this.mobility);
        let netVel = p5.Vector.add(vSelf, vRep);

        // 4) Position update:
        this.pos.add(netVel.mult(dt));

        // 5) Constrain inside canvas (simple reflect):
        this.pos.x = constrain(this.pos.x, 0, width);
        this.pos.y = constrain(this.pos.y, 0, height);
    }

    /**
     * Draw this particle at its current position and heading.
     */
    show() {
        noStroke();
        fill(60, 180, 220);
        ellipse(this.pos.x, this.pos.y, this.r * 2);

        // (Optional) heading indicator
        push();
        stroke(255);
        strokeWeight(0.5);
        let dx = this.r * cos(this.theta);
        let dy = this.r * sin(this.theta);
        line(this.pos.x, this.pos.y, this.pos.x + dx, this.pos.y + dy);
        pop();
    }
}
