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
    }
    show() {
        noStroke();
        fill(255, 60, 60);
        ellipse(this.pos.x, this.pos.y, this.r * 2);
    }
}
