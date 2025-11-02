class Hanchi extends Life {
  constructor(pos, weight) {
    super(pos, weight);

  }

  custom() {
    this.name = "Hanchi";
    this.lifeSpan = 60 * 60;       // 수명
    this.birthInterval = 60 * 40;  // 출산 주기
    this.weightLimit = 60;         // 최대 크기
    this.normalSpeed = 1;          // 평소속도
    this.fastSpeed = 4;            // 공격시 속도
    this.sightAngle = radians(60); // 시야 각도
    this.sightRange = 3;           // 몸크기대비 대야범위
    this.addPart(new Hanchi_01(this));
  }

  drawing() {
    noFill();
    noStroke();
    strokeWeight(1);
    //rect(0,0,this.weight,this.weight);//몸체
    var we = this.weight;

    //엉덩이
    fill("#EFAE90");
    rect(0, 0, we * 0.5, we * 0.8);
    //몸
    fill("#A84A3E");
    rect(0, -we * 0.2, we * 0.6, we * 0.8);
    rect(0, -we * 0.3, we, we * 0.2);
    rect(0, we * 0.2, we, we * 0.2);
    //다리
    rect(-we * 0.4, we * 0.4, we * 0.2, we * 0.4);
    rect(we * 0.4, we * 0.4, we * 0.2, we * 0.4);
    rect(-we * 0.4, -we * 0.4, we * 0.2, we * 0.4);
    rect(we * 0.4, -we * 0.4, we * 0.2, we * 0.4);
    //손발
    fill("#EFAE90");
    rect(-we * 0.45, we * 0.6, we * 0.3, we * 0.1);
    rect(we * 0.45, we * 0.6, we * 0.3, we * 0.1);
    rect(-we * 0.4, -we * 0.6, we * 0.2, we * 0.1);
    rect(we * 0.4, -we * 0.6, we * 0.2, we * 0.1);

    //귀
    fill("#EFAE90");
    ellipse(-we * 0.25, -we * 0.5, we * 0.2, we * 0.2);
    ellipse(we * 0.25, -we * 0.5, we * 0.2, we * 0.2);
    fill("#CE724D");
    ellipse(0, -we * 0.5, we * 0.5, we * 0.5);








  }

  static create() {
    return new Hanchi();
  }

  updateCustom() {
    if (this.birth) {
      world.add(new Hanchi(this.pos.copy()));
    }
  }
}


class Hanchi_01 extends Part {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.speed = radians(360);
  }

  updateCustom() {

  }

  drawing() {
    translate(0, this.parent.weight * 0.3);
    rotate(sin(0.7 * this.movement) * this.speed);
    rect(0, this.parent.weight * 0.3, this.parent.weight * 0.15, this.parent.weight * 0.8);
  }
}








class Nalchi extends Life {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.name = "Nalchi";                 // 이름
    this.lifeSpan = 60 * 60;       // 수명
    this.birthInterval = 60 * 10;  // 출산 주기
    this.weightLimit = 40;         // 최대 크기
    this.normalSpeed = 1;          // 평소속도
    this.fastSpeed = 4;            // 공격시 속도
    this.sightAngle = radians(90); // 시야 각도
    this.sightRange = 5;           // 몸크기대비 대야범위
    this.addPart(new Nalchi_01(this));  // 기관 추가
    this.addPart(new Nalchi_02(this));
  }

  // 개체 그리기
  drawing() {
    noFill();
    noStroke();
    strokeWeight(1);
    var we = this.weight;
    fill("#7DB977");
    ellipse(0, we / 3, we * 0.6, we); //배
    ellipse(0, -we * 0.3, we * 0.4, we * 0.3); //머리
    fill("#cffa98");
    ellipse(0, 0, we * 0.6, we * 0.6); //가슴
    rect(-we * 0.1, -we * 0.45, we * 0.05, we * 0.1);
    rect(we * 0.1, -we * 0.45, we * 0.05, we * 0.1);
  }

  static create() {
    return new Nalchi();
  }

  // 출산 적용시
  updateCustom() {
    if (this.birth) {
      world.add(new Nalchi(this.pos.copy()));
    }

    var separate = this.separate();

    var align = this.align();
    var cohesion = this.cohesion();

    if (this.target) {
      var seek = this.seek(this.target);
      seek.mult(setting.mouseFollow);
      this.applyForce(seek);
    }

    // 시야에 본인보다 2배 무게가 큰 포식자가 있을때 sperate 강도 증가
    let predators = this.boidsInSight.filter(b => b.weight >= this.weight * 2);
    if (predators.length > 0) {
      separate.mult(10);
      align.mult(0);
      cohesion.mult(0);
    } else {
      separate.mult(0.1);
      align.mult(0.2);
      cohesion.mult(0.2);
    }

    this.applyForce(separate);
    this.applyForce(align);
    this.applyForce(cohesion);
  }

}


class Nalchi_01 extends Part {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.speed = 0.2;
  }

  updateCustom() {

  }

  drawing() {
    var pwe = this.parent.weight;
    translate(pwe / 4, 0);
    rotate(sin(this.movement) * this.speed + radians(-15));
    quad(0, 0, pwe / 4, pwe / 2, 0, pwe, -pwe / 8, pwe / 2);
  }
}

class Nalchi_02 extends Part {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.speed = 0.2;
  }

  updateCustom() {

  }

  drawing() {
    var pwe = this.parent.weight;
    translate(-pwe / 4, 0);
    rotate(sin(this.movement + radians(180)) * this.speed + radians(15));
    quad(0, 0, pwe / 8, pwe / 2, 0, pwe, -pwe / 4, pwe / 2);
  }
}



class bloom extends Plant {
  constructor(pos, weight) {
    super(pos, weight);
  }

  custom() {
    this.name = "blooom";                 // 이름

    this.growSpeed = 0.0001;

  }
  drawing() {
    noStroke();
    fill(200, 200, 0);
    ellipse(0, -this.weight / 2, this.weight / 5, this.weight / 5);


  }


  static create() {
    return new bloom();
  }

}





