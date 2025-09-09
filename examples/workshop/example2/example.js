class Boid {
  constructor(x, y) {
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.position = createVector(x, y);
    this.r = 5.0;
    this.maxspeed = 3;
    this.maxforce = 0.05;
  }

  run(boids) {
    this.flock(boids);
    this.update();
    this.borders();
    this.show();
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  flock(boids) {
    let sep = this.separate(boids);
    let ali = this.align(boids);
    let coh = this.cohere(boids);
    sep.mult(1.5);
    ali.mult(1.0);
    coh.mult(1.0);
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    desired.normalize();
    desired.mult(this.maxspeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  }

  show() {
    // 반딧불 효과: glow(초록형광) + 본체
    let angle = this.velocity.heading();
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);

    // glow 효과 (초록형광, 투명도)
    noStroke();
    for (let i = 8; i >= 2; i -= 2) {
      fill(80, 255, 120, map(i, 8, 2, 30, 120));
      ellipse(0, 0, this.r * i, this.r * i);
    }

    // 본체: 타원형(물고기 몸통)
    fill(80, 255, 120, 220);
    ellipse(0, 0, this.r * 4, this.r * 2); // 가로로 긴 타원

    pop();
  }

  borders() {
    if (this.position.x < -this.r) this.position.x = width + this.r;
    if (this.position.y < -this.r) this.position.y = height + this.r;
    if (this.position.x > width + this.r) this.position.x = -this.r;
    if (this.position.y > height + this.r) this.position.y = -this.r;
  }

  separate(boids) {
    let desiredSeparation = 25;
    let steer = createVector(0, 0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if (d > 0 && d < desiredSeparation) {
        let diff = p5.Vector.sub(this.position, boids[i].position);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }
    if (count > 0) {
      steer.div(count);
    }
    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
    }
    return steer;
  }

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

  cohere(boids) {
    let neighborDistance = 50;
    let sum = createVector(0, 0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position);
      if (d > 0 && d < neighborDistance) {
        sum.add(boids[i].position);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum);
    } else {
      return createVector(0, 0);
    }
  }
}
class Flock {
  constructor() {
    this.boids = [];
  }

  run() {
    this.drawMetaballs();
    for (let boid of this.boids) {
      boid.flock(this.boids);
      boid.update();
      boid.borders();
      // boid.show(); // 메타볼 효과로 대체
    }
  }

  addBoid(b) {
    this.boids.push(b);
  }

  // 메타볼(액체 점성) 효과
  drawMetaballs() {
    loadPixels();
    for (let x = 0; x < width; x += 1) {
      for (let y = 0; y < height; y += 1) {
        let sum = 0;
        for (let boid of this.boids) {
          let dx = x - boid.position.x;
          let dy = y - boid.position.y;
          let distSq = dx * dx + dy * dy;
          sum += boid.r * boid.r / (distSq + 1);
        }
        if (sum > 0.7) {
          let idx = 4 * (y * width + x);
          pixels[idx] = 80;     // R (초록형광)
          pixels[idx + 1] = 255; // G
          pixels[idx + 2] = 120; // B
          pixels[idx + 3] = 180; // A (더 진하게)
        }
      }
    }
    updatePixels();
  }
}

let flock;

function setup() {
  createCanvas(640, 640);
  pixelDensity(1); // 픽셀 밀도 고정
  flock = new Flock();
  for (let i = 0; i < 40; i++) {
    let boid = new Boid(width / 2, height / 2);
    flock.addBoid(boid);
  }
}

function draw() {
  background(0); // 검은색 배경
  flock.run();
}

function mouseDragged() {
  flock.addBoid(new Boid(mouseX, mouseY));
}