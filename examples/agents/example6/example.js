// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Demonstration of Craig Reynolds' "Flocking" behavior
// See: http://www.red3d.com/cwr/
// Rules: Cohesion, Separation, Alignment

// Click mouse to add boids into the system

let flock;

// UI 슬라이더
let sepSlider, aliSlider, cohSlider, maxForceSlider, maxSpeedSlider;

// 노이즈 제어
let noiseMode = false;
let t = 0;
const noiseSpeed = 0.005;
const noff = {
  sep: Math.random() * 1000,
  ali: Math.random() * 1000,
  coh: Math.random() * 1000,
  maxF: Math.random() * 1000,
  maxS: Math.random() * 1000,
};

function setup() {
  createCanvas(640, 240);
  flock = new Flock();
  // 초기 보이드 생성
  for (let i = 0; i < 120; i++) {
    let boid = new Boid(width / 2, height / 2);
    flock.addBoid(boid);
  }

  // 슬라이더 UI
  sepSlider = createSlider(0, 3, 1.5, 0.01);
  aliSlider = createSlider(0, 3, 1.0, 0.01);
  cohSlider = createSlider(0, 3, 1.0, 0.01);
  maxForceSlider = createSlider(0.01, 0.5, 0.05, 0.01);
  maxSpeedSlider = createSlider(0.5, 6, 3, 0.1);

  sepSlider.position(10, 10);
  aliSlider.position(10, 30);
  cohSlider.position(10, 50);
  maxForceSlider.position(10, 70);
  maxSpeedSlider.position(10, 90);
}

function draw() {
  background(255);

  // 현재 파라미터 결정 (노이즈 모드면 노이즈 기반, 아니면 슬라이더)
  let sepW, aliW, cohW, maxF, maxS;

  if (noiseMode) {
    t += noiseSpeed;
    sepW = map(noise(noff.sep + t), 0, 1, 0, 3);
    aliW = map(noise(noff.ali + t), 0, 1, 0, 3);
    cohW = map(noise(noff.coh + t), 0, 1, 0, 3);
    maxF = map(noise(noff.maxF + t), 0, 1, 0.01, 0.5);
    maxS = map(noise(noff.maxS + t), 0, 1, 0.5, 6);
  } else {
    sepW = sepSlider.value();
    aliW = aliSlider.value();
    cohW = cohSlider.value();
    maxF = maxForceSlider.value();
    maxS = maxSpeedSlider.value();
  }

  // 표시 텍스트
  noStroke();
  fill(0);
  text(`N 키: Noise ${noiseMode ? 'ON' : 'OFF'}`, 180, 12);
  text(`sep ${sepW.toFixed(2)}  ali ${aliW.toFixed(2)}  coh ${cohW.toFixed(2)}  maxF ${maxF.toFixed(2)}  maxS ${maxS.toFixed(2)}`, 180, 28);

  flock.run({ sepW, aliW, cohW, maxF, maxS });
}

function keyPressed() {
  if (key === 'n' || key === 'N') noiseMode = !noiseMode;
}


// Add a new boid into the System
function mouseDragged() {
  flock.addBoid(new Boid(mouseX, mouseY));
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Flock object
// Does very little, simply manages the array of all the boids

class Flock {

  constructor() {
    // An array for all the boids
    this.boids = []; // Initialize the array
  }

  run(params) {
    for (let boid of this.boids) {
      // 프레임마다 동적 파라미터 적용
      boid.maxforce = params.maxF;
      boid.maxspeed = params.maxS;
      boid.flock(this.boids, params); // 가중치 전달
      boid.update();
      boid.borders();
      boid.show();
    }
  }

  addBoid(b) {
    this.boids.push(b);
  }
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Boid class
// Methods for Separation, Cohesion, Alignment added

class Boid {
  constructor(x, y) {
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.position = createVector(x, y);
    this.r = 3.0;
    this.maxspeed = 3; // Maximum speed
    this.maxforce = 0.05; // Maximum steering force
  }

  run(boids) {
    this.flock(boids);
    this.update();
    this.borders();
    this.show();
  }

  applyForce(force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
  }

  // We accumulate a new acceleration each time based on three rules
  flock(boids, { sepW, aliW, cohW }) {
    let sep = this.separate(boids);
    let ali = this.align(boids);
    let coh = this.cohere(boids);
    sep.mult(sepW);
    ali.mult(aliW);
    coh.mult(cohW);
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }


  // Method to update location
  update() {
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset accelertion to 0 each cycle
    this.acceleration.mult(0);
  }

  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  seek(target) {
    let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force
    return steer;
  }

  show() {
    // Draw a triangle rotated in the direction of velocity
    let angle = this.velocity.heading();
    fill(127);
    stroke(0);
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);
    beginShape();
    vertex(this.r * 2, 0);
    vertex(-this.r * 2, -this.r);
    vertex(-this.r * 2, this.r);
    endShape(CLOSE);
    pop();
  }

  // Wraparound
  borders() {
    if (this.position.x < -this.r) this.position.x = width + this.r;
    if (this.position.y < -this.r) this.position.y = height + this.r;
    if (this.position.x > width + this.r) this.position.x = -this.r;
    if (this.position.y > height + this.r) this.position.y = -this.r;
  }

  // Separation
  // Method checks for nearby boids and steers away
  separate(boids) {
    let desiredSeparation = 25;
    let steer = createVector(0, 0);
    let count = 0;
    // For every boid in the system, check if it's too close
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if (d > 0 && d < desiredSeparation) {
        // Calculate vector pointing away from neighbor
        let diff = p5.Vector.sub(this.position, boids[i].position);
        diff.normalize();
        diff.div(d); // Weight by distance
        steer.add(diff);
        count++; // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
    }
    return steer;
  }

  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  align(boids) {
    let neighborDistance = 50;
    let sum = createVector(0, 0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if (d > 0 && d < neighborDistance) {
        sum.add(boids[i].velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxspeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxforce);
      return steer;
    } else {
      return createVector(0, 0);
    }
  }

  // Cohesion
  // For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
  cohere(boids) {
    let neighborDistance = 50;
    let sum = createVector(0, 0); // Start with empty vector to accumulate all locations
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if (d > 0 && d < neighborDistance) {
        sum.add(boids[i].position); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum); // Steer towards the location
    } else {
      return createVector(0, 0);
    }
  }
}
