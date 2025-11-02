class typo extends Life {
  constructor(pos, weight) {
    super(pos, weight);

  }

  custom() {
    this.name = "A";
    this.lifeSpan = 60 * 60;
    this.normalSpeed = 1;
    this.fastSpeed = 4;
    this.sightRange = 3;
    this.addPart(new typo_tail(this));
    this.addPart(new typo_head(this));
  }

  drawing() {
    //this weight 크기
    fill(150, 250, 100);
    triangle(-this.weight * 0.4, this.weight * 0.01,
      this.weight * 0.4, this.weight * 0.01,
      -this.weight * 0.01, -this.weight * 0.5);
    //머리


    // 등 지느러미
    //rect(0,this.weight*0.1,this.weight*0.1,this.weight*0.5);

  }

  static create() {
    return new typo();
  }

  updateCustom() {
    if (this.birth) {
      world.add(new typo(this.pos.copy()));
    }
  }
}

class typo_tail extends Part {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    // 각도
    this.speed = 0.2;
    this.movement = radians(10);
  }

  updateCustom() {

  }

  drawing() {
    //translate(0,this.parent.weight*0.5);
    rotate(sin(this.movement) * this.speed);
    //this.parent.weight 몸체의 크기
    fill(150, 250, 100);
    triangle(-this.parent.weight * 0.2, this.parent.weight * 0.5,
      this.parent.weight * 0.2, this.parent.weight * 0.5,
      -this.parent.weight * 0.01, -this.parent.weight * 0.1);
  }
}


class typo_head extends Part {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    // 각도
    this.speed = 0.2;
    this.movement = radians(60);
  }

  updateCustom() {

  }

  drawing() {
    //translate(0,this.parent.weight*0.5);
    rotate(sin(this.movement) * this.speed);
    //this.parent.weight 몸체의 크기
    fill(255);
    ellipse(-this.parent.weight * 0.05, -this.parent.weight * 0.5, this.parent.weight * 0.3, this.parent.weight * 0.3);
  }
}

class typo2 extends Life {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.name = "B";                 // 이름
    this.lifeSpan = 60 * 60;       // 수명
    this.birthInterval = 60 * 20;  // 출산 주기
    this.weightLimit = 50;         // 최대 크기
    this.normalSpeed = 1;          // 평소속도
    this.fastSpeed = 4;            // 공격시 속도
    this.sightAngle = radians(45); // 시야 각도
    this.sightRange = 3;           // 몸크기대비 대야범위
    this.addPart(new typo2_part(this));
    this.addPart(new typo2_arm1(this));
    this.addPart(new typo2_arm2(this));// 기관 추가
  }

  // 개체 그리기
  drawing() {

  }

  static create() {
    return new typo2();
  }

  // 출산 적용시
  updateCustom() {
    if (this.birth) {
      world.add(new typo2(this.pos.copy()));
    }
  }
}

class typo2_part extends Part {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.speed = 5;
  }

  updateCustom() {

  }

  drawing() {

    // 0, -1
    // 1, 1
    // -1, 1
    fill(255, 100, 0);
    translate(0, sin(this.movement * 0.1) * this.parent.weight * 0.1);
    triangle(
      0, -this.parent.weight * 0.8,
      this.parent.weight * 0.6, this.parent.weight * 0.5,
      -this.parent.weight * 0.6, this.parent.weight * 0.5
    );
  }
}

class typo2_arm1 extends Part {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.speed = 5;
  }

  updateCustom() {

  }

  drawing() {
    rotate(sin(this.movement * 0.05) * this.speed * 0.1);
    rect(this.parent.weight * 0.75, this.parent.weight * 0.1, this.parent.weight * 0.5, this.parent.weight * 0.1);
  }
}


class typo2_arm2 extends Part {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.speed = 5;
  }

  updateCustom() {

  }

  drawing() {
    rotate(sin(this.movement * 0.05) * this.speed * 0.1);
    rect(-this.parent.weight * 0.75, this.parent.weight * 0.1, this.parent.weight * 0.5, this.parent.weight * 0.1);
  }
}

class plant_typo extends Plant {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.growSpeed = 0.07;
  }

  drawing() {
    stroke(100, 255, 0);
    strokeWeight(2);
    line(0, 0, 0, -this.weight);
    ellipse(0, -this.weight, 3, 3);
  }

  static create() {
    return new plant_typo();
  }
}