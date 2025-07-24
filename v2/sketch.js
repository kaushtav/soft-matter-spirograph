/// <reference path="./node_modules/@types/p5/global.d.ts" />

// ----------------------------------------
// Global Variables & Simulation Constants
// ----------------------------------------
let ap;                         // Attractive Point
let spps = [];                  // Self-propelled particles
let trails = [];                // Particle trails

let windowWidth = 1200;
let windowHeight = 800;
let zoomFactor = 3.0;

// Particle configuration
let N = 1;                      // Number of SPPs
let initialKF = 0.5;            // Attraction strength of AP
let initialKFSPP = 0.5;         // Attraction strength towards AP per SPP
let initialSpeed = 4;
let timeStep = 0.1;             // Simulation timestep
let initialRadius = 4;
let mobility = 0.25;            // Mobility coefficient (fixed)
let epsilon = 1;                // Repulsion coefficient (fixed)
let trailLength = Math.max(100, 5000 / N); // Trail buffer size

// UI flags
let showTrails = true;
let useNoise = false;

// ----------------------------------------
// Utility: Log total momentum of system
// ----------------------------------------
function logTotalMomentum() {
    let totalMomentum = createVector(0, 0);

    for (let p of spps) {
        let vel = createVector(
            p.speed * Math.cos(p.theta),
            p.speed * Math.sin(p.theta)
        );
        totalMomentum.add(vel);
    }

    if (ap.vel) {
        totalMomentum.add(ap.vel.copy());
    }

    console.log("Total linear momentum (magnitude):", totalMomentum.mag().toFixed(4));
    // console.log("Vector:", totalMomentum);
}

// ----------------------------------------
// p5.js Setup
// ----------------------------------------
function setup() {
    createCanvas(windowWidth, windowHeight);

    // Create the single Attractive Point at canvas center
    ap = new AttractivePoint(
        windowWidth / 2,
        windowHeight / 2,
        initialKF,
        initialRadius
    );

    createToolbar();   // Load sliders & buttons from utils.js
    spawnSPPs();       // Generate initial SPPs
}

// ----------------------------------------
// p5.js Draw Loop
// ----------------------------------------
function draw() {
    background(20);

    // --- Step 0: Read slider values and update AP/SPP parameters ---
    let newKF = sliderKF.value();
    let newKfSPP = sliderKF_SPP.value();
    let newSpeed = sliderSpeed.value() / timeStep;
    let newRadius = sliderRadius.value();

    labelKF.html(`Kf = ${newKF.toFixed(2)}`);
    labelKF_SPP.html(`KfSPP = ${newKfSPP.toFixed(2)}`);
    labelSpeed.html(`Speed = ${(newSpeed * timeStep).toFixed(1)}`);
    labelRadius.html(`Radius = ${newRadius}`);

    ap.strength = newKF;
    ap.r = newRadius;

    push();
    translate(width / 2, height / 2);
    scale(zoomFactor);
    translate(-width / 2, -height / 2);

    ap.show();  // Draw Attractive Point

    // Step 1: Update each particle with new slider params
    for (let i = 0; i < N; i++) {
        let p = spps[i];
        p.strength = newKfSPP;
        p.speed = newSpeed;
        p.r = newRadius;
        p.mobility = mobility;
        p.epsilon = epsilon;
    }

    // Step 2: Clear all forces
    for (let p of spps) p.totalForce = createVector(0, 0);
    ap.totalForce = createVector(0, 0);

    // Step 3: SPP–SPP Repulsion (Symmetric Newton's Third Law)
    for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
            if (i === j) continue;
            let pi = spps[i];
            let pj = spps[j];
            let rij = p5.Vector.sub(pi.pos, pj.pos);
            let d = rij.mag();

            if (d > 0 && d < 6 * pi.r) {
                let s12 = Math.pow(2 * pi.r, 12);
                let d13 = Math.pow(d, 13);
                let force = rij.copy().normalize().mult(epsilon * (s12 / max(d13, 2 * pi.r)));

                pi.totalForce.add(force);
                pj.totalForce.sub(force);
            }
        }
    }

    // Step 4: AP–SPP Mutual Repulsion
    for (let p of spps) {
        let rij = p5.Vector.sub(p.pos, ap.pos);
        let d = rij.mag();

        if (d < 6 * ap.r) {
            let s12 = pow(ap.r * 2, 12);
            let d13 = pow(d, 13);
            let force = rij.copy().normalize().mult(epsilon * (s12 / d13));

            p.totalForce.add(force);
            ap.totalForce.sub(force);
        }
    }

    // Step 5: Update Orientation (alignment + noise)
    for (let p of spps) {
        p.updateOrientation(ap, spps);
    }

    // Step 6: Apply movement from forces
    for (let p of spps) {
        p.updateFromForce();  // includes v_self + v_repulsion
    }
    ap.updateFromForce(timeStep);  // Only v_repulsion

    // Step 7: Render all SPPs and trails
    for (let i = 0; i < N; i++) {
        let p = spps[i];
        showParticleTrails(showTrails, trails, i, p);
        noStroke();
        p.show();
    }

    pop();
}

// ----------------------------------------
// p5.js Resize and Zoom Events
// ----------------------------------------
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mouseWheel(event) {
    let sensitivity = 0.001;
    zoomFactor *= (1 - event.delta * sensitivity);
    zoomFactor = constrain(zoomFactor, 0.2, 10);
    return false;
}
