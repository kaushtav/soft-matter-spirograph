// sketch.js

let ap;
let spps = [];
let N = 500;          // number of SPPs
let sppSpeed = 1;    // constant speed v for each SPP
let KF = 1;        // initial coupling constant (will be adjustable by a slider)
let sliderKF;

function setup() {
    createCanvas(windowWidth, windowHeight);

    // 1) Create the single AP at canvas center:
    ap = new AttractivePoint(width / 2, height / 2, KF);

    // 2) Create N SPPs at random positions:
    for (let i = 0; i < N; i++) {
        let x = random(width);
        let y = random(height);
        // you can also randomize the initial orientation:
        let theta0 = random(0, TWO_PI);
        spps.push(new SelfPropelledParticle(x, y, sppSpeed, 4, theta0));
    }

    // 3) Create a slider to adjust K_F between 0 and 1.5
    sliderKF = createSlider(0, 1.5, KF, 0.01);
    sliderKF.position(20, 20);
    sliderKF.style('width', '200px');
}

function draw() {
    background(20);

    // read slider value each frame
    let newKF = sliderKF.value();
    ap.strength = newKF;

    // display label
    noStroke();
    fill(255);
    textSize(14);
    text(`K_F = ${newKF.toFixed(2)}`, sliderKF.x * 2 + sliderKF.width, 35);

    // 4) Draw the AP:
    ap.show();

    // 5) Update & draw each SPP:
    for (let p of spps) {
        p.update(ap);
        p.show();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
