// sangjun custom 1
class SuperMob extends Life {
  constructor(pos, weight) {
    super(pos, weight);

  }

  custom() {
    this.name = "SuperMob"; // 이름
    this.lifeSpan = 60 * 60; // 수명
    this.birthInterval = 60 * 20; // 출산 주기
    this.weightLimit = 50; // 최대 크기
    this.normalSpeed = 1; // 평소속도
    this.fastSpeed = 4; // 공격시 속도
    this.sightAngle = radians(45); // 시야 각도
    this.sightRange = 3; // 몸크기대비 대야범위
    this.addPart(new Tale(this));
    this.addPart(new Fin(this));
  }

  drawing() {
    ellipse(
      0, 0, this.weight * 0.45, this.weight
    )
    fill("#333399")
    ellipse(
      5, -(this.weight * 0.2), this.weight * 0.2, this.weight * 0.2
    )

    // 입
    push();
    fill("#000")
    ellipse(
      0, -(this.weight * 0.5), this.weight * 0.2, this.weight * 0.2
    )
    pop();


  }

  static create() {
    return new SuperMob();
  }

  updateCustom() {
    if (this.birth) {
      world.add(new SuperMob(this.pos.copy()));
    }
  }

}

class Tale extends Part {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.speed = 0.3;
  }

  updateCustom() {
    fill("#33399")
  }

  drawing() {
    rotate(sin(this.movement) * this.speed);
    triangle(-this.parent.weight * 0.3, this.parent.weight * 0.6, 0,
      this.parent.weight * 0.5, this.parent.weight * 0.5,
      this.parent.weight * 0.95
    );

  }
}

class Fin extends Part {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.speed = 0.2;
  }

  updateCustom() {
    fill("#33399")
  }

  drawing() {
    rotate(sin(this.movement) * this.speed);
    arc(this.parent.weight * 0.2, this.parent.weight * 0.15,
      this.parent.weight / 2, this.parent.weight / 2, 0,
      PI + QUARTER_PI, OPEN
    );
  }
}


// sangjun custom 2
class HyperMob extends Life {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.name = "HyperMob"; // 이름
    this.lifeSpan = 60 * 60; // 수명
    this.birthInterval = 60 * 20; // 출산 주기
    this.weightLimit = 50; // 최대 크기
    this.normalSpeed = 1; // 평소속도
    this.fastSpeed = 4; // 공격시 속도
    this.sightAngle = radians(45); // 시야 각도
    this.sightRange = 3; // 몸크기대비 대야범위
    this.addPart(new HeadHyper(this)); // 기관 추가
    this.addPart(new Arm_1(this)); // 기관 추가
    this.addPart(new Arm_2(this)); // 기관 추가
  }

  // 개체 그리기
  drawing() {
    strokeWeight(1);
    fill("#FFF300");
    noStroke();
    // ellipse(0, 0, this.weight, this.weight);

    translate(0,
      sin(this.movement * 0.7) * this.weight * 0.1
    )

  }

  static create() {
    return new HyperMob();
  }

  // 출산 적용시
  updateCustom() {
    if (this.birth) {
      world.add(new HyperMob(this.pos.copy()));
    }
  }
}


class HeadHyper extends Part {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.speed = 0.1;
  }

  updateCustom() {

  }

  drawing() {
    rotate(sin(this.movement) * this.speed);
    fill('#FFCA3B')
    translate(0,
      sin(this.movement * 0.7) * this.parent.weight * 0.1
    )
    triangle(0, -this.parent.weight * 0.8,
      this.parent.weight * 0.5, this.parent.weight * 0.3,
      -this.parent.weight * 0.5, this.parent.weight * 0.3
    );
  }
}

class Arm_1 extends Part {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.speed = 0.5;
  }

  updateCustom() {

  }

  drawing() {
    fill("#FFCA3B");
    rotate(sin(this.movement) * this.speed + radians(90));
    rect(0, this.parent.weight * 0.75,
      this.parent.weight * 0.1, this.parent.weight * 0.4
    );
  }
}

class Arm_2 extends Part {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.speed = 0.5;
  }

  updateCustom() {

  }

  drawing() {
    fill("#AC710C");
    rotate(sin(this.movement) * this.speed + radians(-90));
    rect(0, this.parent.weight * 0.75,
      this.parent.weight * 0.1, this.parent.weight * 0.4
    );
  }
}


// sangjun custom 3
class PlantCustom extends Plant {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.growSpeed = 0.03;
  }

  drawing() {
    strokeWeight(5);
    if (this.weight > 18) {
      stroke("#78FF00");
      fill("#78FF00");
    } else {
      stroke("#444");
      fill("#444");
    }
    line(0, 0, 0, -this.weight);
    ellipse(0, -this.weight, 10, 10);

  }

  static create() {
    return new PlantCustom();
  }

}
