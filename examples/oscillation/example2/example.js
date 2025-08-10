// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

let bob1, bob2;
let spring1, spring2;

function setup() {
    createCanvas(400, 400);

    // 첫 번째 스프링: 고정점 → bob1
    spring1 = new Spring(width / 2, 10, 100);
    bob1 = new Bob(width / 2, 100);

    // 두 번째 스프링: bob1 → bob2
    spring2 = new Spring(bob1.position.x, bob1.position.y, 100);
    bob2 = new Bob(width / 2, 200);
}

function draw() {
    background(255);

    let gravity = createVector(0, 2);

    // 중력 적용
    bob1.applyForce(gravity);
    bob2.applyForce(gravity);

    // bob 업데이트 및 드래그 처리
    bob1.update();
    bob1.handleDrag(mouseX, mouseY);
    bob2.update();
    bob2.handleDrag(mouseX, mouseY);

    // 첫 번째 스프링: 고정점 → bob1
    spring1.connect(bob1);
    spring1.constrainLength(bob1, 30, 200);

    // 두 번째 스프링: bob1 → bob2 (anchor를 bob1 위치로 갱신)
    spring2.anchor = bob1.position.copy();
    spring2.connect(bob2);
    spring2.constrainLength(bob2, 30, 200);

    // 그리기
    spring1.showLine(bob1);
    bob1.show();
    spring1.show();

    spring2.showLine(bob2);
    bob2.show();
    spring2.show();
}

function mousePressed() {
    bob1.handleClick(mouseX, mouseY);
    bob2.handleClick(mouseX, mouseY);
}

function mouseReleased() {
    bob1.stopDragging();
    bob2.stopDragging();
}

// Nature of Code
// Daniel Shiffman
// Chapter 3: Oscillation

// Object to describe an anchor point that can connect to "Bob" objects via a spring
// Thank you: http://www.myphysicslab.com/spring2d.html

class Spring {
    constructor(x, y, length) {
        this.anchor = createVector(x, y);
        this.restLength = length;
        this.k = 0.2;
    }
    // Calculate and apply spring force
    connect(bob) {
        // Vector pointing from anchor to bob location
        let force = p5.Vector.sub(bob.position, this.anchor);
        // What is distance
        let currentLength = force.mag();
        // Stretch is difference between current distance and rest length
        let stretch = currentLength - this.restLength;

        //{!2 .bold} Direction and magnitude together!
        force.setMag(-1 * this.k * stretch);

        //{!1} Call applyForce() right here!
        bob.applyForce(force);
    }

    constrainLength(bob, minlen, maxlen) {
        //{!1} Vector pointing from Bob to Anchor
        let direction = p5.Vector.sub(bob.position, this.anchor);
        let length = direction.mag();

        //{!1} Is it too short?
        if (length < minlen) {
            direction.setMag(minlen);
            //{!1} Keep position within constraint.
            bob.position = p5.Vector.add(this.anchor, direction);
            bob.velocity.mult(0);
            //{!1} Is it too long?
        } else if (length > maxlen) {
            direction.setMag(maxlen);
            //{!1} Keep position within constraint.
            bob.position = p5.Vector.add(this.anchor, direction);
            bob.velocity.mult(0);
        }
    }

    //{!5} Draw the anchor.
    show() {
        fill(127);
        circle(this.anchor.x, this.anchor.y, 10);
    }

    //{!4} Draw the spring connection between Bob position and anchor.
    showLine(bob) {
        stroke(0);
        line(bob.position.x, bob.position.y, this.anchor.x, this.anchor.y);
    }
}

// Bob object, just like our regular Mover (location, velocity, acceleration, mass)

class Bob {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = createVector();
        this.acceleration = createVector();
        this.mass = 24;
        // Arbitrary damping to simulate friction / drag
        this.damping = 0.98;
        // For user interaction
        this.dragOffset = createVector();
        this.dragging = false;
    }

    // Standard Euler integration
    update() {
        this.velocity.add(this.acceleration);
        this.velocity.mult(this.damping);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    }

    // Newton's law: F = M * A
    applyForce(force) {
        let f = force.copy();
        f.div(this.mass);
        this.acceleration.add(f);
    }

    // Draw the bob
    show() {
        stroke(0);
        strokeWeight(2);
        fill(127);
        if (this.dragging) {
            fill(200);
        }
        circle(this.position.x, this.position.y, this.mass * 2);
    }

    handleClick(mx, my) {
        let d = dist(mx, my, this.position.x, this.position.y);
        if (d < this.mass) {
            this.dragging = true;
            this.dragOffset.x = this.position.x - mx;
            this.dragOffset.y = this.position.y - my;
        }
    }

    stopDragging() {
        this.dragging = false;
    }

    handleDrag(mx, my) {
        if (this.dragging) {
            this.position.x = mx + this.dragOffset.x;
            this.position.y = my + this.dragOffset.y;
        }
    }
}
