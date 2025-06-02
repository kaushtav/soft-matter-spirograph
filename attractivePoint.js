// attractivePoint.js

class AttractivePoint {
    /**
     * @param {number} x        – x‐coordinate of the AP
     * @param {number} y        – y‐coordinate of the AP
     * @param {number} strength – coupling strength (K_F in the paper)
     */
    constructor(x, y, strength = 0.5) {
        this.pos = createVector(x,y);
        this.strength = strength;
        this.r = 8; // for drawing
    }

    /**
     * Returns a p5.Vector pointing from sppPos → AP,
     * but normalized and scaled to this.strength.
     * We also expose the angle φ (bearing) from sppPos → AP.
     *
     * @param {p5.Vector} sppPos
     * @returns {Object} { force: p5.Vector, phi: number }
     */
    attractVector(sppPos) {
        // raw vector from SPP to AP:
        let raw = p5.Vector.sub(this.pos, sppPos);
        let d = raw.mag();
        // optionally, we can clamp d here to avoid divergences if too close
        let phi = raw.heading(); // bearing angle φ in [–PI, PI]
        let unit = raw.copy().normalize().mult(this.strength);
        return { force: unit, phi };
    }

    show() {
        noStroke();
        fill(255, 60, 60);
        ellipse(this.pos.x, this.pos.y, this.r * 2);
    }
}
