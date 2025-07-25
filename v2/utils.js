/// <reference path="./node_modules/@types/p5/global.d.ts" />

// -------------------------------
// UI Controls: Sliders & Buttons
// -------------------------------
let sliderKF, sliderSpeed, sliderRadius, sliderKF_SPP;
let labelKF, labelSpeed, labelRadius, labelKF_SPP;
let toggleTrailsButton, toggleNoiseButton;
let inputN, setNButton, setRButton;

/**
 * Creates the toolbar for UI controls:
 * - Sliders for K_F, K_F (SPP), Speed, Radius
 * - Toggle buttons for trails and noise
 * - Input to set particle count
 */
function createToolbar() {
    // ---- (a) Slider: K_F (Attractive Point) ----
    labelKF = createDiv('K_F = 0.10');
    labelKF.position(10, 25).style('color', 'white').style('padding', '4px 8px');
    sliderKF = createSlider(0, 1.0, initialKF, 0.01);
    sliderKF.position(110, 25).style('width', '100px').style('padding', '4px 8px');

    // ---- (b) Slider: K_F (SPP–SPP coupling) ----
    labelKF_SPP = createDiv('K_F (SPP-SPP) = 0.10');
    labelKF_SPP.position(10, 45).style('color', 'white').style('padding', '4px 8px');
    sliderKF_SPP = createSlider(0, 0.5, initialKFSPP, 0.01);
    sliderKF_SPP.position(110, 45).style('width', '100px').style('padding', '4px 8px');

    // ---- (c) Slider: Speed ----
    labelSpeed = createDiv('Speed = 1.0');
    labelSpeed.position(10, 65).style('color', 'white').style('padding', '4px 8px');
    sliderSpeed = createSlider(0.1, 2, initialSpeed * timeStep, 0.1);
    sliderSpeed.position(110, 65).style('width', '100px').style('padding', '4px 8px');

    // ---- (d) Slider: Radius ----
    labelRadius = createDiv('Radius = 6');
    labelRadius.position(10, 85).style('color', 'white').style('padding', '4px 8px');
    sliderRadius = createSlider(1, 10, initialRadius, 0.1);
    sliderRadius.position(110, 85).style('width', '100px').style('padding', '4px 8px');

    // ---- (e) Button: Toggle Trails ----
    toggleTrailsButton = createButton(showTrails ? 'Turn Trails Off' : 'Turn Trails On');
    toggleTrailsButton.position(250, 30)
        .style('width', '120px')
        .style('padding', '4px 8px')
        .style('color', 'white')
        .style('background-color', '#333')
        .mousePressed(() => {
            showTrails = !showTrails;
            if (!showTrails) {
                for (let i = 0; i < N; i++) trails[i] = [];
                toggleTrailsButton.html('Turn Trails On');
            } else {
                toggleTrailsButton.html('Turn Trails Off');
            }
        });

    // ---- (f) Button: Toggle Noise ----
    toggleNoiseButton = createButton('Turn Noise On');
    toggleNoiseButton.position(250, 60)
        .style('width', '120px')
        .style('padding', '4px 7px')
        .style('color', 'white')
        .style('background-color', '#333')
        .mousePressed(() => {
            useNoise = !useNoise;
            toggleNoiseButton.html(useNoise ? 'Turn Noise Off' : 'Turn Noise On');
        });

    // ---- (g) Input: Set Number of SPPs ----
    inputN = createInput(String(N), 'number');
    inputN.position(400, 30)
        .style('width', '50px')
        .style('height', '20px')
        .style('padding', '2px 8px')
        .attribute('min', '1');

    // ---- (h) Button: Apply N ----
    setNButton = createButton('Set SPP count');
    setNButton.position(470, 30)
        .style('color', 'white')
        .style('width', '120px')
        .style('height', '30px')
        .style('padding', '4px 8px')
        .style('background-color', '#333')
        .mousePressed(() => {
            let newVal = parseInt(inputN.value());
            if (!isNaN(newVal) && newVal > 0) {
                N = newVal;
                spps = [];
                trails = [];
                spawnSPPs();
            }
        });

    // ---- (g) Input: Set Number of SPPs ----
    inputM = createInput(String(M), 'number');
    inputM.position(400, 60)
        .style('width', '50px')
        .style('height', '20px')
        .style('padding', '2px 8px')
        .attribute('min', '1');

    // ---- (h) Button: Apply N ----
    setMButton = createButton('Set AP count');
    setMButton.position(470, 60)
        .style('color', 'white')
        .style('width', '120px')
        .style('height', '30px')
        .style('padding', '4px 8px')
        .style('background-color', '#333')
        .mousePressed(() => {
            let newVal = parseInt(inputM.value());
            if (!isNaN(newVal) && newVal > 0) {
                M = newVal;
                spps = [];
                trails = [];
                spawnSPPs();
            }
        });

    // ---- (i) Button: Reset Simulation ----
    setRButton = createButton('Reset Simulation');
    setRButton.position(600, 30)
        .style('color', 'white')
        .style('width', '100px')
        .style('height', '60px')
        .style('padding', '4px 8px')
        .style('background-color', '#333')
        .mousePressed(() => {
            let newVal = parseInt(inputN.value());
            if (!isNaN(newVal) && newVal > 0) {
                N = newVal;
                spps = [];
                trails = [];
                spawnSPPs();
                ap = new AttractivePoint(
                    windowWidth / 2,
                    windowHeight / 2,
                    initialKF,
                    initialRadius
                );
            }
        });
}

/**
 * Draws a fading trail behind each particle.
 * @param {boolean} showTrails – Whether to draw trails
 * @param {Array[]} trails     – Array of position history arrays
 * @param {number} i           – Index of the particle
 * @param {SelfPropelledParticle} particle – The particle being drawn
 */
function showParticleTrails(showTrails, trails, i, particle) {
    if (showTrails) {
        trails[i].push(particle.pos.copy());

        if (trails[i].length > trailLength) {
            trails[i].shift();  // remove oldest position
        }

        stroke(100, 200, 240, 150);
        strokeWeight(0.5);

        for (let j = 1; j < trails[i].length; j++) {
            let prevPos = trails[i][j - 1];
            let currPos = trails[i][j];
            line(prevPos.x, prevPos.y, currPos.x, currPos.y);
        }
    }
}

/**
 * Spawns exactly N self-propelled particles randomly in space.
 * Avoids placing them too close to the Attractive Point.
 */
function spawnSPPs() {
    const spawnBuffer = initialRadius * 2;

    for (let i = 0; i < N; i++) {
        let x, y, d;
        do {
            x = random(width / 4, 0.75 * width);
            y = random(height / 4, 0.75 * height);
            d = dist(x, y, windowWidth / 2, windowHeight / 2);
        } while (d < spawnBuffer);  // Avoid spawning too close to AP

        let theta0 = random(TWO_PI);

        spps.push(
            new SelfPropelledParticle(
                x,
                y,
                initialKFSPP,     // strength (SPP–SPP)
                initialSpeed,     // speed (will be overwritten in draw loop)
                initialRadius,    // radius (will be overwritten in draw loop)
                theta0,
                mobility,         // constant
                epsilon,          // constant
                timeStep          // constant
            )
        );

        trails.push([]);  // Initialize empty trail buffer
    }
}
