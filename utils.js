let sliderKF,
    sliderSpeed,
    sliderRadius;
let labelKF,
    labelSpeed,
    labelRadius;
let toggleTrailsButton,
    toggleNoiseButton,
    inputN,
    setNButton;

function createToolbar() {
    // ---- (a) K_F slider + label ----
    labelKF = createDiv('K_F = 0.10');
    labelKF.position(10, 5);
    labelKF.style('color', 'white');
    sliderKF = createSlider(0.01, 1.5, initialKF, 0.01);
    sliderKF.position(60, 25);
    sliderKF.style('width', '100px');

    // ---- (b) Speed slider + label ----
    labelSpeed = createDiv('Speed = 1.0');
    labelSpeed.position(200, 5);
    labelSpeed.style('color', 'white');
    sliderSpeed = createSlider(0.1, 5, initialSpeed * timeStep, 0.1);
    sliderSpeed.position(260, 25);
    sliderSpeed.style('width', '100px');

    // ---- (c) Radius slider + label ----
    labelRadius = createDiv('Radius = 6');
    labelRadius.position(380, 5);
    labelRadius.style('color', 'white');
    sliderRadius = createSlider(0.1, 50, initialRadius, 0.1);
    sliderRadius.position(450, 25);
    sliderRadius.style('width', '100px');

    // ---- (d) “Hide Trails” toggle button ----
    toggleTrailsButton = createButton('Turn Trails On');
    toggleTrailsButton.position(650, 15);
    toggleTrailsButton.style('padding', '4px 8px');
    toggleTrailsButton.style('color', 'white');
    toggleTrailsButton.style('background-color', '#333');
    toggleTrailsButton.mousePressed(() => {
        showTrails = !showTrails;
        if (!showTrails) {
            for (let i = 0; i < N; i++) {
                trails[i] = [];
            }
            toggleTrailsButton.html('Turn Trails On');
        } else {
            toggleTrailsButton.html('Turn Trails Off');
        }
    });

    // ---- (e) “Noise On/Off” toggle button ----
    toggleNoiseButton = createButton('Turn Noise On');
    toggleNoiseButton.position(760, 15);
    toggleNoiseButton.style('padding', '4px 8px');
    toggleNoiseButton.style('color', 'white');
    toggleNoiseButton.style('background-color', '#333');
    toggleNoiseButton.mousePressed(() => {
        useNoise = !useNoise;
        toggleNoiseButton.html(useNoise ? 'Turn Noise Off' : 'Turn Noise On');
    });

    // ---- (f) Input + “Set N” for changing particle count ----
    inputN = createInput(String(N), 'number');
    inputN.position(880, 25);
    inputN.style('width', '50px');
    inputN.attribute('min', '1');

    setNButton = createButton('Set N');
    setNButton.position(940, 25);
    setNButton.style('padding', '4px 8px');
    setNButton.style('color', 'white');
    setNButton.style('background-color', '#333');
    setNButton.mousePressed(() => {
        let newVal = parseInt(inputN.value());
        if (!isNaN(newVal) && newVal > 0) {
            N = newVal;
            // Clear existing particles & trails
            spps = [];
            trails = [];
            spawnSPPs();
        }
    });
}


// Draw the trail for particle i (if enabled)
function showParticleTrails(showTrails, trails, i, particle) {
    if (showTrails) {
        trails[i].push(particle.pos.copy());
        if (trails[i].length > trailLength) {
            trails[i].shift();
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


// Spawn exactly N SPPs (with no SPP–SPP repulsion, since it's commented)
function spawnSPPs() {
    let spawnBuffer = initialRadius * 2; // ensure spawn distance ≥ one diameter

    for (let i = 0; i < N; i++) {
        let x, y, d;
        do {
            x = random(width);
            y = random(height);
            d = dist(x, y, ap.pos.x, ap.pos.y);
        } while (d < spawnBuffer);

        let theta0 = random(0, TWO_PI);
        spps.push(
            new SelfPropelledParticle(
                x,
                y,
                initialSpeed,    // overwritten each frame in draw()
                initialRadius,   // overwritten each frame in draw()
                theta0,
                mobility,        // constant, no slider
                epsilon,         // constant=2, no slider
                timeStep
            )
        );
        trails.push([]);   // initialize an empty trail array
    }
}
