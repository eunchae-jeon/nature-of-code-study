// ...existing code...

class ShyJelly extends Life {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.name = "ShyJelly";
    this.lifeSpan = 60 * 60;        // 수명
    this.birthInterval = 60 * 35;   // 출산 주기(기본값, 내부 타이머로도 제어)
    this.weightLimit = 45;          // 최대 크기
    this.normalSpeed = 1.4;         // 평소속도
    this.fastSpeed = 3.2;           // 도망 속도
    this.sightAngle = radians(100); // 시야 각도
    this.sightRange = 4;            // 몸크기 대비 시야범위
    this.nibbleRate = 0.04;         // 한 번에 먹는 양(작게)
    this.separateWeight = 1;        // 동적 분산 가중치
    this._lastBirth = 0;            // 마지막 출산 프레임
  }

  // 귀여운 젤리 모양
  drawing() {
    noStroke();
    const we = this.weight;
    // 젤리 몸통
    fill(255, 180, 200, 220);
    ellipse(0, 0, we * 0.9, we * 0.7);
    // 눈
    fill(40);
    ellipse(-we * 0.15, -we * 0.05, we * 0.08, we * 0.08);
    ellipse(we * 0.15, -we * 0.05, we * 0.08, we * 0.08);
    // 볼터치
    fill(255, 120, 150, 150);
    ellipse(-we * 0.22, we * 0.05, we * 0.12, we * 0.08);
    ellipse(we * 0.22, we * 0.05, we * 0.12, we * 0.08);
  }

  // 먹을 수 있는 대상: 식물만
  canEat(other) {
    return other && other.weight > 0 && (other instanceof Plant || other.name === 'plant' || other.name === 'blooom');
  }

  // 가장 가까운 식물을 타깃으로
  findTarget() {
    this.target = null;
    let best = Infinity;
    for (let b of this.boidsInSight) {
      if (!this.canEat(b)) continue;
      const d = this.pos.dist(b.pos);
      if (d < best) { best = d; this.target = b; }
    }
    this.maxSpeedTarget = this.target ? this.normalSpeed : this.normalSpeed; // 식물만 쫓으니 평속 유지
  }

  // 포식자(큰 개체) 있는지 감지
  hasPredator() {
    const predators = this.boidsInSight.filter(b =>
      b !== this &&
      b.weight >= this.weight * 1.4 && // 나보다 훨씬 크면 위협
      !(b instanceof Plant)            // 식물은 제외
    );
    return predators;
  }

  applyBehaviors(force) {
    // 위협 감지
    const predators = this.hasPredator();

    // 기본 플로킹
    const separate = this.separate();
    const align = this.align();
    const cohesion = this.cohesion();

    if (predators.length > 0) {
      // 평균 포식자 위치로부터 도망(Flee)
      let center = createVector(0, 0);
      for (let p of predators) center.add(p.pos);
      center.div(predators.length);

      let desired = p5.Vector.sub(this.pos, center); // 반대 방향
      desired.normalize().mult(this.fastSpeed);
      let flee = p5.Vector.sub(desired, this.vel).limit(this.maxForce);

      // 지그재그 작은 잡음
      const n = noise(frameCount * 0.05 + this.pos.x * 0.002);
      const jitter = p5.Vector.fromAngle(this.theta + map(n, 0, 1, -0.6, 0.6)).mult(0.05);

      this.applyForce(flee.add(jitter));
      this.separateWeight = 3.0; // 더 흩어짐
    } else {
      // 안전하면 식물 타깃
      this.findTarget();
      if (this.target) {
        let seek = this.seek(this.target);
        seek.mult(0.8); // 너무 들이대지 않도록 완만히
        this.applyForce(seek);
      }
      this.separateWeight = 1.2;
    }

    // 가중치 적용
    separate.mult(this.separateWeight);
    align.mult(0.6);
    cohesion.mult(0.8);

    this.applyForce(separate);
    this.applyForce(align);
    this.applyForce(cohesion);
  }

  // 식물 살짝 베어먹기(즉시 소멸 안 함)
  predation() {
    if (!this.target || !this.canEat(this.target)) return;
    const d = this.pos.dist(this.target.pos);
    const capture = Math.max(this.weight * 0.5, this.target.weight * 0.3);
    if (d < capture) {
      const bite = Math.min(this.nibbleRate, this.target.weight);
      this.target.target_weight = Math.max(0, this.target.target_weight - bite);
      this.target_weight = Math.min(this.weightLimit, this.target_weight + bite * 0.7);
      // 너무 오래 한 곳에 머무르지 않게 가끔 타깃 해제
      if (random() < 0.02) this.target = null;
    }
  }

  updateCustom() {
    // 충분히 커지면 분열
    if (this.target_weight > this.weightLimit * 0.85 && frameCount - this._lastBirth > this.birthInterval) {
      const childW = this.weight * 0.45;
      this.target_weight = this.weight *= 0.55;
      const offset = p5.Vector.random2D().mult(10);
      const child = new ShyJelly(this.pos.copy().add(offset), childW);
      if (typeof world !== 'undefined' && world.add) world.add(child);
      this._lastBirth = frameCount;
    }
  }

  static create() {
    return new ShyJelly();
  }
}