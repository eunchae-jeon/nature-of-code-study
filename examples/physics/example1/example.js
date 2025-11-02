// Matter.js 기반으로 보이드에 물리 바디를 부여하고, 스티어링 힘을 Body.applyForce로 적용하도록 변경

const { Engine, World, Bodies, Body, Composite } = Matter;

let engine, world;
let flock;

function setup() {
  createCanvas(640, 240);

  engine = Engine.create();
  world = engine.world;
  // 중력 제거
  world.gravity.x = 0;
  world.gravity.y = 0;

  flock = new Flock();
  for (let i = 0; i < 120; i++) {
    let boid = new Boid(width / 2, height / 2);
    flock.addBoid(boid);
  }
}

function draw() {
  background(255);
  // Matter 물리 스텝
  Engine.update(engine, 1000 / 60);
  flock.run();
}

class Flock {
  constructor() {
    this.boids = [];
  }

  run() {
    for (let boid of this.boids) {
      boid.run(this.boids);
    }
  }

  addBoid(b) {
    this.boids.push(b);
  }
}

class Boid {
  constructor(x, y) {
    // 렌더/계산 보조용
    this.r = 6.0;
    this.maxspeed = 2.5;     // 최대 속도 (Matter setVelocity로 클램프)
    this.maxforce = 0.0008;  // 최대 조향력 (applyForce에 바로 사용, 매우 작게)

    // 시각화용(속도 거의 0일 때 방향 유지)
    this._heading = 0;

    // 부드러운 회전용 상태
    this.faceAngle = random(TWO_PI); // 현재 바라보는 각도
    this.maxTurn = 0.12;             // 프레임당 최대 회전(rad)
    this.smoothVel = createVector(random(-0.1, 0.1), random(-0.1, 0.1)); // 속도 저역통과

    // Matter 원형 바디
    const options = {
      restitution: 0.2,
      frictionAir: 0.05,
      friction: 0.0,
      density: 0.0015
    };
    this.body = Bodies.circle(x, y, this.r, options);
    Body.setVelocity(this.body, { x: random(-1, 1), y: random(-1, 1) });
    World.add(world, this.body);
  }

  // 각도 래핑 [-PI, PI]
  angleWrap(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  // 속도를 저역통과 → 바라보는 각도를 점진적으로 변화
  updateFacing() {
    // 속도 스무딩
    this.smoothVel.lerp(this.velocity, 0.2);
    if (this.smoothVel.magSq() < 1e-4) return; // 거의 정지면 각도 유지

    const desired = Math.atan2(this.smoothVel.y, this.smoothVel.x);
    let delta = this.angleWrap(desired - this.faceAngle);
    // 프레임당 최대 회전 제한
    delta = constrain(delta, -this.maxTurn, this.maxTurn);
    this.faceAngle += delta;

    // 물리 바디 각도도 맞추고 각속도 제거(바디 스핀 방지)
    Body.setAngle(this.body, this.faceAngle);
    Body.setAngularVelocity(this.body, 0);
  }


  // 헬퍼: p5.Vector로 포지션/속도 얻기
  get position() {
    return createVector(this.body.position.x, this.body.position.y);
  }
  get velocity() {
    return createVector(this.body.velocity.x, this.body.velocity.y);
  }

  run(boids) {
    this.flock(boids);
    this.limitSpeed();
    this.borders();
    this.updateFacing(); // ← 추가: 회전 보간
    this.show();
  }

  applyForce(force) {
    // p5.Vector -> Matter force
    Body.applyForce(this.body, this.body.position, { x: force.x, y: force.y });
  }

  // 속도 클램프(최대 속도 제한)
  limitSpeed() {
    const v = this.body.velocity;
    const speed = Math.hypot(v.x, v.y);
    if (speed > this.maxspeed) {
      const s = this.maxspeed / speed;
      Body.setVelocity(this.body, { x: v.x * s, y: v.y * s });
    }
  }

  // 스티어링 계산
  flock(boids) {
    let sep = this.separate(boids); // Separation
    let ali = this.align(boids);    // Alignment
    let coh = this.cohere(boids);   // Cohesion

    // 가중치
    sep.mult(1.2);
    ali.mult(0.9);
    coh.mult(0.9);

    // 힘 적용
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }

  // 목표점으로 향하기
  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    if (desired.magSq() === 0) return createVector(0, 0);
    desired.normalize();
    desired.mult(this.maxspeed);
    let steer = desired.sub(this.velocity);
    // 최대 조향력 제한
    if (steer.mag() > this.maxforce) steer.setMag(this.maxforce);
    return steer;
  }

  show() {
    const v = this.body.velocity;
    const speed = Math.hypot(v.x, v.y);
    if (speed > 1e-3) this._heading = Math.atan2(v.y, v.x);
    const pos = this.body.position;

    push();
    translate(pos.x, pos.y);
    rotate(this.faceAngle); // ← 스무딩된 각도 사용
    fill(127);
    stroke(0);
    beginShape();
    vertex(this.r * 2, 0);
    vertex(-this.r * 2, -this.r);
    vertex(-this.r * 2, this.r);
    endShape(CLOSE);
    pop();
  }

  // 화면 래핑(벽 대신 워프)
  borders() {
    let x = this.body.position.x;
    let y = this.body.position.y;
    const r = this.r;

    if (x < -r) x = width + r;
    if (y < -r) y = height + r;
    if (x > width + r) x = -r;
    if (y > height + r) y = -r;

    // 위치만 순간 이동
    Body.setPosition(this.body, { x, y });
  }

  // Separation
  separate(boids) {
    const desiredSeparation = 25;
    let steer = createVector(0, 0);
    let count = 0;
    const myPos = this.position;

    for (let i = 0; i < boids.length; i++) {
      if (boids[i] === this) continue;
      const otherPos = boids[i].position;
      const d = p5.Vector.dist(myPos, otherPos);
      if (d > 0 && d < desiredSeparation) {
        let diff = p5.Vector.sub(myPos, otherPos);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) steer.div(count);
    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      if (steer.mag() > this.maxforce) steer.setMag(this.maxforce);
    }
    return steer;
  }

  // Alignment
  align(boids) {
    const neighborDistance = 50;
    let sum = createVector(0, 0);
    let count = 0;
    const myPos = this.position;

    for (let i = 0; i < boids.length; i++) {
      if (boids[i] === this) continue;
      const otherPos = boids[i].body.position;
      const d = dist(myPos.x, myPos.y, otherPos.x, otherPos.y);
      if (d > 0 && d < neighborDistance) {
        const ov = boids[i].body.velocity;
        sum.add(ov.x, ov.y);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      if (sum.magSq() > 0) {
        sum.setMag(this.maxspeed);
        let steer = sum.sub(this.velocity);
        if (steer.mag() > this.maxforce) steer.setMag(this.maxforce);
        return steer;
      }
    }
    return createVector(0, 0);
  }

  // Cohesion
  cohere(boids) {
    const neighborDistance = 50;
    let center = createVector(0, 0);
    let count = 0;
    const myPos = this.position;

    for (let i = 0; i < boids.length; i++) {
      if (boids[i] === this) continue;
      const otherPos = boids[i].body.position;
      const d = dist(myPos.x, myPos.y, otherPos.x, otherPos.y);
      if (d > 0 && d < neighborDistance) {
        center.add(otherPos.x, otherPos.y);
        count++;
      }
    }

    if (count > 0) {
      center.div(count);
      return this.seek(center);
    } else {
      return createVector(0, 0);
    }
  }
}