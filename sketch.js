/// <reference path="./node_modules/@types/p5/global.d.ts" />

let ap;
let spps = [];
let trails = [];
let windowWidth = 1200,
    windowHeight = 800;
let zoomFactor = 1.0;

// Number of particles
let N = 10;

// Initial (default) parameter values
let initialKF = 0.2;
let initialSpeed = 10;
let timeStep = 0.1;    // Δt = 0.1 (paper uses 0.001, but we keep 0.1 per your request)
let initialRadius = 5;
let mobility = 0.25;   // fixed
let epsilon = 2;       // fixed
let trailLength = Math.max(100, 5000 / N);

// Sliders + Labels + Buttons (declared in utils.js)


// Toggle flags
let showTrails = false;
let useNoise = false;

function setup() {
    createCanvas(windowWidth, windowHeight);

    // 1) Create the single Attractive Point (AP) at canvas center:
    ap = new AttractivePoint(
        windowWidth / 2,
        windowHeight / 2,
        initialKF,
        initialRadius
    );

    // 2) Build the toolbar (sliders + toggle buttons + input field)
    createToolbar();

    // 3) Spawn the initial batch of N SPPs
    spawnSPPs();
}

function draw() {
    background(20);

    // --- Read slider values & update labels + AP parameters ---
    let newKF = sliderKF.value();
    let newSpeed = sliderSpeed.value() / timeStep;  // slider holds speed·dt
    let newRadius = sliderRadius.value();

    labelKF.html(`K_F = ${newKF.toFixed(2)}`);
    labelSpeed.html(`Speed = ${(newSpeed * timeStep).toFixed(1)}`);
    labelRadius.html(`Radius = ${newRadius}`);

    ap.strength = newKF;
    ap.r = newRadius;

    // --- Zoom‐wrapped drawing ---
    push();
    translate(width / 2, height / 2);
    scale(zoomFactor);
    translate(-width / 2, -height / 2);

    // Draw the AP (red dot)
    ap.show();

    // Update & draw each SPP
    for (let i = 0; i < N; i++) {
        let p = spps[i];

        // Overwrite each SPP’s per‐frame parameters:
        p.speed = newSpeed;
        p.r = newRadius;
        p.mobility = mobility;
        p.epsilon = epsilon;

        p.update(ap, spps);  // orientation + position update
        showParticleTrails(showTrails, trails, i, p);
        noStroke();
        p.show();
    }

    pop();

    // Note: Sliders, input box, and toggle buttons are not scaled.
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Mouse wheel → adjust zoomFactor
function mouseWheel(event) {
    let sensitivity = 0.001;
    zoomFactor *= (1 - event.delta * sensitivity);
    zoomFactor = constrain(zoomFactor, 0.2, 10);
    return false;
}
