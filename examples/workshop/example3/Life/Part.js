class Part {
  constructor(parent, pos = new p5.Vector(0, 0)) {
    this.pos = pos;
    this.move = new p5.Vector();
    this.parent = parent;
    this.movement = 0;
    this.speed = 0.1;

    this.custom();
  }

  custom() {

  }

  update() {
    this.updateCustom();
    this.updateMovement();
  }

  updateMovement() {
    this.movement += this.parent.vel.mag() * this.speed;
  }

  moving() {

  }

  updateCustom() { }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    this.drawing();
    pop();
  }

  drawing() {
    rotate(sin(this.movement) * 0.25);
    rect(0, this.parent.weight * 0.75, this.parent.weight * 0.1, this.parent.weight * 0.4);
  }
}
