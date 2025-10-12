// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Demonstration of Craig Reynolds' "Flocking" behavior
// See: http://www.red3d.com/cwr/
// Rules: Cohesion, Separation, Alignment

// Click mouse to add boids into the system

let flock;
let fovDeg = 120; // 시야 각도(도)
let fovSlider;

function setup() {
  createCanvas(640, 240);
  flock = new Flock();
  // Add an initial set of boids into the system
  for (let i = 0; i < 120; i++) {
    let boid = new Boid(width / 2, height / 2);
    flock.addBoid(boid);
  }
  // 시야 각도 슬라이더 추가
  fovSlider = createSlider(30, 180, 120, 1);
  fovSlider.position(10, 10);
  fovSlider.style('width', '120px');
}

function draw() {
  background(255);
  fovDeg = fovSlider.value(); // 슬라이더 값으로 시야 각도 업데이트
  flock.run();
}

// Add a new boid into the System
function mouseDragged() {
  // flock.addBoid(new Boid(mouseX, mouseY));
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

  run() {
    for (let boid of this.boids) {
      boid.run(this.boids); // Passing the entire list of boids to each boid individually
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
    this.leftEvade = random() < 0.5; // 오른쪽 회피 여부
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
  flock(boids) {
    let sep = this.separate(boids); // Separation
    let ali = this.align(boids); // Alignment
    let coh = this.cohere(boids);
    let view = this.viewRule(boids); // View rule (시야 방해 회피)
    sep.mult(1.5);
    ali.mult(1.0);
    coh.mult(1.0);
    view.mult(1.5); // 시야 규칙 가중치
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
    this.applyForce(view);
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
    if (this === flock.boids[0]) {
      fill(255, 0, 0, 50);
    } else {
      strokeWeight(1);
      stroke(0);
      fill(127);
    }
    stroke(0);
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);
    beginShape();
    vertex(this.r * 2, 0);
    vertex(-this.r * 2, -this.r);
    vertex(-this.r * 2, this.r);
    endShape(CLOSE);

    // 1번째 보이드의 시야(파이모양) 시각화
    if (this === flock.boids[0]) {
      fill(255, 0, 0, 50);
      stroke(255, 0, 0, 120);
      strokeWeight(2);
      let neighborDistance = 50;
      arc(0, 0, neighborDistance * 2, neighborDistance * 2, -radians(fovDeg / 2), radians(fovDeg / 2));
    }
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

  viewRule(boids) {
    let steer = createVector(0, 0);
    let count = 0;
    let fov = radians(fovDeg); // 시야 각도

    for (let i = 0; i < boids.length; i++) {
      if (boids[i] === this) continue;
      let toOther = p5.Vector.sub(boids[i].position, this.position);
      let d = toOther.mag();
      let angleToOther = abs(p5.Vector.angleBetween(this.velocity, toOther));
      // 내 시야 안에 있으면 시야 방해로 간주
      if (d > 0 && angleToOther < fov / 2) {
        let side = toOther.copy().rotate(HALF_PI).setMag(1);
        if (this.leftEvade) side.mult(-1);
        steer.add(side);
        count++;
      }
    }
    if (count > 0) {
      steer.div(count);
      steer.setMag(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
    }
    return steer;
  }
}
