class Life {
  constructor(pos = new p5.Vector(random(-width / 2, width / 2), random(-height / 2, height / 2)), weight = null) {
    this.pos = pos;
    this.vel = new p5.Vector();
    this.acc = new p5.Vector();
    this.maxForce = 0.1;
    this.r = 20;
    this.theta = 0;
    this.angle;

    this.sight = 100;
    this.sightAngle = Math.PI * 0.4;
    this.sightRange = 2;

    this.normalSpeed = 1;
    this.fastSpeed = 4;

    this.boidsInSight = [];
    this.mouseFollowing = false;

    this.target = null;
    this.weightLimit = 50;
    this.parts = [];

    this.life = 0;
    this.lifeSpan = 60 * 60;

    this.birthInterval = 60 * 20;
    this.birth = false;

    this.custom();
    this.init();
    if (weight) this.target_weight = this.weight = weight;
    this.sight = this.weight * this.sightRange;
    this.maxSpeedTarget = this.maxSpeed = this.normalSpeed;
    this.birthTime = this.birthInterval + int(random(-5, 30));

    let force = p5.Vector.random2D();
    force.mult(random());
    this.applyForce(force);
  }

  custom() {

  }

  init() {
    this.target_weight = this.weight = random(0.1, 0.3) * this.weightLimit;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  applyBehaviors(force) {
    this.findTarget();

    var separate = this.separate();

    var align = this.align();
    var cohesion = this.cohesion();

    if (this.target) {
      var seek = this.seek(this.target);
      seek.mult(setting.mouseFollow);
      this.applyForce(seek);
    }

    separate.mult(0.0);
    align.mult(0.0);
    cohesion.mult(0.0);

    this.applyForce(separate);
    this.applyForce(align);
    this.applyForce(cohesion);
  }

  seek(target) {
    var angle = p5.Vector.sub(target.pos, this.pos);
    angle = angle.heading() - this.theta;
    if (abs(angle) > Math.PI) angle = angle / abs(angle) * (abs(angle) - Math.PI * 2);
    if (this.pos.dist(target.pos) > 0 &&
      this.pos.dist(target.pos) < this.sight &&
      abs(angle) < this.sightAngle) {

      var desired = p5.Vector.sub(target.pos, this.pos);
      desired.setMag(this.maxSpeed);
      var steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce);
    } else {
      var steer = new p5.Vector(0, 0);
    }

    return steer;
  }

  align(boids) {
    var sum = new p5.Vector();
    var count = 0;
    for (var i = 0; i < this.boidsInSight.length; i++) {
      let boid = this.boidsInSight[i];
      if (boid.name == this.name) sum.add(this.boidsInSight[i].vel);
    }
    if (count > 0) sum.div(count);
    sum.setMag(this.maxSpeed);
    return sum;
  }

  cohesion(boids) {
    var sum = new p5.Vector();
    var count = 0;
    for (var i = 0; i < this.boidsInSight.length; i++) {
      let boid = this.boidsInSight[i];
      if (boid.name == this.name) sum.add(this.boidsInSight[i].pos);
    }
    if (count > 0) sum.div(count);
    return this.seek({
      pos: sum
    });
  }

  separate() {
    var desiredspeparation = this.r * 2;
    var sum = new p5.Vector();
    var count = 0;
    for (var i = 0; i < this.boidsInSight.length; i++) {
      let boid = this.boidsInSight[i];
      if (boid.name == this.name && this.pos.dist(boid.pos) < desiredspeparation) {
        var desired = p5.Vector.sub(boid.pos, this.pos);
        desired.setMag(-this.maxSpeed);
        var steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);

        sum.add(steer);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
    }
    return sum;
  }

  findTarget() {

    for (var i = 0; i < this.boidsInSight.length; i++) {
      let boid = this.boidsInSight[i];
      if (boid.name != this.name && boid.weight > 0 && boid.weight < this.weight / 2) {
        if (this.target) {
          if (this.pos.dist(boid.pos) < this.pos.dist(this.target.pos)) this.target = boid;
        } else {
          this.target = boid
        }
        this.maxSpeedTarget = this.fastSpeed;
      }
    }
  }


  checkSight(boids) {
    this.boidsInSight = [];
    for (var i = 0; i < boids.length; i++) {
      var angle = p5.Vector.sub(boids[i].pos, this.pos);
      angle = angle.heading() - this.theta;
      if (abs(angle) > Math.PI) angle = angle / abs(angle) * (abs(angle) - Math.PI * 2);
      if (this.pos.dist(boids[i].pos) > 0 &&
        this.pos.dist(boids[i].pos) < this.sight &&
        abs(angle) < this.sightAngle) {

        this.boidsInSight.push(boids[i]);
      }
    }
  }



  predation() {
    if (this.target && this.pos.dist(this.target.pos) < this.weight) {
      this.target_weight += this.target.weight * 0.6;
      if (this.target_weight > this.weightLimit) this.target_weight = this.weightLimit;
      this.target.target_weight = this.target.weight = 0;
      this.target = null;
      this.maxSpeedTarget = this.normalSpeed;
    }
  }

  update() {
    this.moving();
    this.updateCustom();
    this.partUpdate();

    if (this.life == this.birthTime) {
      this.birth = true;
      this.birthTime += this.birthInterval + int(random(-5, 30));
    }
    else this.birth = false;

    this.life++;
    if (this.life > this.lifeSpan) this.weight = 0;
  }

  moving() {

    this.sight = this.weight * this.sightRange;
    this.weight = lerp(this.weight, this.target_weight, 0.1);
    this.maxSpeed = lerp(this.maxSpeed, this.maxSpeedTarget, 0.1);

    let newTheta = this.vel.heading();
    let sub = newTheta - this.theta;
    if (abs(sub) > PI) {
      if (sub > 0) sub = sub - TWO_PI, -PI * 0.001;
      else sub = sub + TWO_PI;
    }
    sub = constrain(sub, -PI * 0.02, PI * 0.02)
    this.theta += sub;

    this.checkSight(world.boids);
    this.applyBehaviors();

    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.worldEdge();

    this.predation();
  }

  partUpdate() {
    for (let part of this.parts) {
      part.update();
    }
  }

  updateCustom() { }

  worldEdge() {
    if (this.pos.x > width / 2 + this.sight) this.pos.x = -width / 2 - this.sight;
    else if (this.pos.x < -width / 2 - this.sight) this.pos.x = width / 2 + this.sight;

    if (this.pos.y > height / 2 + this.sight) this.pos.y = -height / 2 - this.sight;
    else if (this.pos.y < -height / 2 - this.sight) this.pos.y = height / 2 + this.sight;
  }

  display() {
    stroke(255);
    fill(255);
    strokeWeight(0);
    push();
    translate(this.pos.x, this.pos.y);
    rectMode(CENTER);
    if (!isDrawingMode) rotate(this.theta + HALF_PI);
    this.drawing();
    for (let part of this.parts) {
      part.display();
    }
    pop();

  }

  drawing() { }

  addPart(part) {
    this.parts.push(part);
  }

  create() {
    return new Life();
  }

  guide() {
    push();
    noStroke();
    fill(255, 0, 0);
    strokeWeight(1);
    push();
    translate(this.pos.x, this.pos.y);
    if (!isDrawingMode) rotate(this.theta);
    else rotate(-HALF_PI);
    push();
    noFill();
    stroke(255, 0, 0);
    circle(0, 0, this.weight);
    pop();
    push();
    rotate(-this.sightAngle);
    line(0, 0, this.sight, 0);
    pop();
    push();
    rotate(this.sightAngle);
    line(0, 0, this.sight, 0);
    pop();
    arc(0, 0, this.sight * 2, this.sight * 2, -this.sightAngle, this.sightAngle);
    pop();

    if (this.mouseFollowing) ellipse(mouse.x, mouse.y, 10, 10);
    pop();
  }
}

class Plant extends Life {
  constructor(pos, weight) {
    super(pos, weight);
    this.growSpeed = 0.01;
    this.custom();
  }

  display() {
    stroke(255);
    fill(255);
    strokeWeight(0);
    push();
    translate(this.pos.x, this.pos.y);
    rectMode(CENTER);
    this.drawing();
    for (let part of this.parts) {
      part.display();
    }
    pop();

  }

  update() {
    this.partUpdate();
    this.life++;
    if (this.life > this.lifeSpan) this.weight = 0;
    this.weight += this.growSpeed;
  }

  create() {
    return new Plant();
  }

  guide() { }
}