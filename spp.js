// spp.js

class SelfPropelledParticle {
    /**
     * @param {number} x     – initial x
     * @param {number} y     – initial y
     * @param {number} v     – constant speed magnitude
     * @param {number} r     – radius for drawing
     * @param {number} theta – initial orientation angle (optional)
     */
    constructor(x, y, v = 1, r = 4, theta = null) {
        this.pos = createVector(x, y);
        this.speed = v;
        this.r = r;

        // If no initial angle provided, pick random in [0, 2π)
        this.theta = theta !== null ? theta : random(0, TWO_PI);
    }

    /**
     * Update this SPP’s orientation + position, given the AP.
     * - Use Euler integration with Δt = 1 for simplicity.
     * - Coupling constant K_F is taken from ap.strength.
     *
     * @param {AttractivePoint} ap
     */
    update(ap) {
        // 1) Get AP’s unit vector & bearing φ from this.pos
        let { force, phi } = ap.attractVector(this.pos);
        let K_F = ap.strength;

        // 2) Update orientation θ via overdamped coupling:
        //    dθ = K_F * sin(φ − θ)   (Euler: θ ← θ + Δt * K_F * sin(φ − θ))
        let dtheta = K_F * sin(phi - this.theta);
        this.theta += dtheta;

        // 3) Move forward at speed v in direction θ (Δt = 1 for simplicity)
        let vx = this.speed * cos(this.theta);
        let vy = this.speed * sin(this.theta);
        this.pos.x += vx;
        this.pos.y += vy;

        // 4) Optional: bounce off bottom edge (similar to the paper’s excluded‐volume bounce)
        if (this.pos.y > height - this.r) {
            this.pos.y = height - this.r;
            // reflect vertical component of instantaneous “velocity”
            // so that it bounces:
            this.theta = -this.theta;
            // ensure θ is in [–PI, PI):
            this.theta = atan2(sin(this.theta), cos(this.theta));
        }
    }

    update(ap) {
        let { force, phi } = ap.attractVector(this.pos);
        let K_F = ap.strength;

        // Deterministic alignment:
        let dtheta = K_F * sin(phi - this.theta);

        // Rotational noise (zero‐mean Gaussian):
        let noiseStrength = 0.01;
        let randomKick = noiseStrength * randomGaussian();

        this.theta += dtheta + randomKick;
        // wrap θ into [–PI, PI):
        this.theta = atan2(sin(this.theta), cos(this.theta));

        // Move forward:
        let vx = this.speed * cos(this.theta);
        let vy = this.speed * sin(this.theta);
        this.pos.x += vx;
        this.pos.y += vy;

        // Bounce off bottom:
        if (this.pos.y > height - this.r) {
            this.pos.y = height - this.r;
            this.theta = -this.theta;
            this.theta = atan2(sin(this.theta), cos(this.theta));
        }
    }

    // update(ap) {
    //     let { force, phi } = ap.attractVector(this.pos);
    //     let K_F = ap.strength;
    //
    //     // Deterministic alignment:
    //     let dtheta = K_F * sin(phi - this.theta);
    //
    //     // Rotational noise (zero‐mean Gaussian):
    //     let noiseStrength = 0.01;
    //     let randomKick = noiseStrength * randomGaussian();
    //
    //     this.theta += dtheta + randomKick;
    //     // wrap θ into [–PI, PI):
    //     this.theta = atan2(sin(this.theta), cos(this.theta));
    //
    //     // Move forward:
    //     let vx = this.speed * cos(this.theta);
    //     let vy = this.speed * sin(this.theta);
    //     this.pos.x += vx;
    //     this.pos.y += vy;
    //
    //     // Bounce off bottom:
    //     if (this.pos.y > height - this.r) {
    //         this.pos.y = height - this.r;
    //         this.theta = -this.theta;
    //         this.theta = atan2(sin(this.theta), cos(this.theta));
    //     }
    // }


    show() {
        noStroke();
        fill(60, 180, 220);
        ellipse(this.pos.x, this.pos.y, this.r * 2);

        // (Optional) draw a small line indicating heading θ:
        push();
        stroke(255);
        strokeWeight(2);
        let dx = this.r * cos(this.theta);
        let dy = this.r * sin(this.theta);
        line(this.pos.x, this.pos.y, this.pos.x + dx, this.pos.y + dy);
        pop();
    }
}
