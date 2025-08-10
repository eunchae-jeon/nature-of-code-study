
let pendulum;

function setup() {
    createCanvas(400, 400);
    // Make a new Pendulum with an origin position and armlength
    pendulum = new Pendulum(width / 2, 0, 175);
}

function draw() {
    background(255);
    pendulum.update();
    pendulum.show();

    pendulum.drag(); // for user interaction
}

function mousePressed() {
    pendulum.clicked(mouseX, mouseY);
}

function mouseReleased() {
    pendulum.stopDragging();
}

// This constructor could be improved to allow a greater variety of pendulums
class Pendulum {
    constructor(x, y, r) {
        // Fill all variables
        this.pivot = createVector(x, y);
        this.bob = createVector();
        this.r = r;
        this.angle = PI / 4;

        this.angleVelocity = 0.0;
        this.angleAcceleration = 0.0;
        this.damping = 0.995; // Arbitrary damping
        this.ballr = 24.0; // Arbitrary ball radius
    }

    // Function to update position
    update() {
        // As long as we aren't dragging the pendulum, let it swing!
        if (!this.dragging) {
            let gravity = 0.1; // Arbitrary constant
            this.angleAcceleration = ((-1 * gravity) / this.r) * sin(this.angle); // Calculate acceleration (see: http://www.myphysicslab.com/pendulum1.html)

            this.angleVelocity += this.angleAcceleration; // Increment velocity
            this.angle += this.angleVelocity; // Increment angle

            this.angleVelocity *= this.damping; // Apply some damping
        }
    }

    show() {
        this.bob.set(this.r * sin(this.angle), this.r * cos(this.angle), 0);
        this.bob.add(this.pivot);

        stroke(0);
        strokeWeight(2);
        line(this.pivot.x, this.pivot.y, this.bob.x, this.bob.y);
        fill(127);
        circle(this.bob.x, this.bob.y, this.ballr * 2);

        // --- 중력에 의한 힘(진자 방향) 화살표 ---
        let gravity = 0.1;
        let Fg = gravity; // 중력 크기 (질량=1로 가정)
        let tensionDir = p5.Vector.sub(this.pivot, this.bob).normalize();
        let gravityDir = createVector(-tensionDir.y, tensionDir.x).mult(-1); // 수직 벡터
        let Fgx = Fg * sin(this.angle);
        let Fgy = Fg * cos(this.angle);
        let FgxVec = gravityDir.copy().mult(Fgx * 500); // 크기 조정
        let FgStart = this.bob.copy();
        let FgEnd = p5.Vector.add(FgStart, FgxVec);
        stroke(80, 160, 255);
        strokeWeight(3);
        line(FgStart.x, FgStart.y, FgEnd.x, FgEnd.y);
        fill(80, 160, 255);
        noStroke();
        this.drawArrow(FgStart, FgEnd, 10);
        // Fgx 라벨
        fill(80, 160, 255);
        textSize(16);
        textAlign(LEFT, CENTER);
        text('Fgx', FgEnd.x + 8, FgEnd.y);

        // --- 장력(Tension) 화살표 ---
        let v = this.angleVelocity * this.r;
        let T = gravity * cos(this.angle) + (v * v) / this.r;
        let TensionVec = tensionDir.copy().mult(T * 500); // 크기 조정
        let TensionStart = this.bob.copy();
        let TensionEnd = p5.Vector.add(TensionStart, TensionVec);
        stroke(255, 120, 80);
        strokeWeight(3);
        line(TensionStart.x, TensionStart.y, TensionEnd.x, TensionEnd.y);
        fill(255, 120, 80);
        noStroke();
        this.drawArrow(TensionStart, TensionEnd, 10);
        // T 라벨
        fill(255, 120, 80);
        textSize(16);
        textAlign(LEFT, CENTER);
        text('T', TensionEnd.x + 8, TensionEnd.y);

        // --- 장력(Tension) 반대 중력 화살표 (Fgy) ---
        let FgyVec = tensionDir.copy().mult(Fgy * 500); // 크기 조정
        let FgyStart = this.bob.copy();
        let FgyEnd = p5.Vector.add(FgyStart, FgyVec.mult(-1)); // 반대 방향
        stroke(255, 120, 255);
        strokeWeight(3);
        line(FgyStart.x, FgyStart.y, FgyEnd.x, FgyEnd.y);
        fill(255, 120, 255);
        noStroke();
        this.drawArrow(FgyStart, FgyEnd, 10);
        // Fgy 라벨
        fill(255, 120, 255);
        textSize(16);
        textAlign(LEFT, CENTER);
        text('Fgy', FgyEnd.x + 8, FgyEnd.y);
    }

    drawArrow(base, vecEnd, size) {
        let dir = p5.Vector.sub(vecEnd, base).normalize();
        let left = p5.Vector.add(vecEnd, p5.Vector.fromAngle(dir.heading() + PI * 0.75).mult(size));
        let right = p5.Vector.add(vecEnd, p5.Vector.fromAngle(dir.heading() - PI * 0.75).mult(size));
        triangle(vecEnd.x, vecEnd.y, left.x, left.y, right.x, right.y);
    }

    // The methods below are for mouse interaction

    // This checks to see if we clicked on the pendulum ball
    clicked(mx, my) {
        let d = dist(mx, my, this.bob.x, this.bob.y);
        if (d < this.ballr) {
            this.dragging = true;
        }
    }

    // This tells us we are not longer clicking on the ball
    stopDragging() {
        this.angleVelocity = 0; // No velocity once you let go
        this.dragging = false;
    }

    drag() {
        // If we are draging the ball, we calculate the angle between the
        // pendulum origin and mouse position
        // we assign that angle to the pendulum
        if (this.dragging) {
            let diff = p5.Vector.sub(this.pivot, createVector(mouseX, mouseY)); // Difference between 2 points
            this.angle = atan2(-1 * diff.y, diff.x) - radians(90); // Angle relative to vertical axis
        }
    }
}
