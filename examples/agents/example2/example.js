// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Seeking "vehicle" follows the mouse position

// Implements Craig Reynold's autonomous steering behaviors
// One vehicle "seeks"
// See: http://www.red3d.com/cwr/
let showTarget = false;
let vehicle;
function keyPressed() {
  if (key === 'r' || key === 'R') {
    showTarget = !showTarget;
  }
}
function setup() {
  createCanvas(640, 240);
  vehicle = new Vehicle(width / 2, height / 2);
}

function draw() {
  background(255);

  let mouse = createVector(mouseX, mouseY);

  // Draw an ellipse at the mouse position
  fill(127);
  stroke(0);
  strokeWeight(2);
  circle(mouse.x, mouse.y, 48);

  // Call the appropriate steering behaviors for our agents
  vehicle.seek(mouse);
  vehicle.update();
  vehicle.show();

}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// The "Vehicle" class

class Vehicle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.r = 6;
    this.maxspeed = 8;
    this.maxforce = 0.2;
    this.orbitRadius = 100; // 초기 반경
    this.angle = 0; // 초기 각도
    this.orbitOffset = random(TWO_PI); // 각 개체별 궤도 오프셋
    this.orbitRadius = 100;
    this.orbitSpeed = 0.03;
    this.t = 0;
    this.newTarget = createVector();
  }

  // Method to update location
  update() {
    this.t = frameCount * this.orbitSpeed + this.orbitOffset; // 각 개체별 오프셋(랜덤)

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  applyForce(force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
  }

  // A method that calculates a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  seek(target) {

    this.newTarget.set(
      target.x + this.orbitRadius * cos(this.t),
      target.y + this.orbitRadius * sin(this.t)
    );
    let desired = p5.Vector.sub(this.newTarget, this.position); // A vector pointing from the location to the target

    // 거리 계산
    let d = p5.Vector.dist(this.position, this.newTarget);

    // 가까우면 orbitRadius 점점 줄임, 멀면 초기화
    if (d < 100) {
      this.orbitRadius = max(50, this.orbitRadius * 0.997); // 최소 20까지 점점 줄임
    } else {
      this.orbitRadius = 120; // 초기값으로 복원
    }
    // Scale to maximum speed
    // desired.setMag(this.maxspeed);
    desired.mult(0.05);

    // Steering = Desired minus velocity
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force

    this.applyForce(steer);
  }
  show() {
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
    // newTarget(빨간 점) 표시
    if (showTarget) {
      push();
      fill(255, 0, 0);
      noStroke();
      ellipse(this.newTarget.x, this.newTarget.y, 8, 8); // 작고 빨간 점
      pop();
    }
  }
}
