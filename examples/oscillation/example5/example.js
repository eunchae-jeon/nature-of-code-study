
let pendulum1, pendulum2;

function setup() {
    createCanvas(400, 400);
    // 첫 번째 진자: 화면 위쪽 중앙에서 시작
    pendulum1 = new Pendulum(width / 2, 0, 120);
    pendulum2 = new Pendulum(0, 0, 120); // pivot은 pendulum1.bob에서 매 프레임 갱신
}

function draw() {
    background(255);

    // 첫 번째 진자 업데이트 및 그리기
    pendulum1.update();
    pendulum1.show();

    // 두 번째 진자 pivot을 첫 번째 진자 끝으로 갱신
    pendulum2.pivot = pendulum1.bob.copy();
    pendulum2.update();
    pendulum2.show();

    // 드래그 처리 (둘 중 하나만 드래그 가능)
    pendulum1.drag();
    pendulum2.drag();
}

function mousePressed() {
    pendulum1.clicked(mouseX, mouseY);
    pendulum2.clicked(mouseX, mouseY);
}

function mouseReleased() {
    pendulum1.stopDragging();
    pendulum2.stopDragging();
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
        this.damping = 1; // Arbitrary damping
        this.ballr = 24.0; // Arbitrary ball radius
    }

    // Function to update position
    update() {
        // As long as we aren't dragging the pendulum, let it swing!
        if (!this.dragging) {
            let gravity = 0.4; // Arbitrary constant
            this.angleAcceleration = ((-1 * gravity) / this.r) * sin(this.angle); // Calculate acceleration (see: http://www.myphysicslab.com/pendulum1.html)

            this.angleVelocity += this.angleAcceleration; // Increment velocity
            this.angle += this.angleVelocity; // Increment angle

            this.angleVelocity *= this.damping; // Apply some damping
        }
    }

    show() {
        this.bob.set(this.r * sin(this.angle), this.r * cos(this.angle), 0); // Polar to cartesian conversion
        this.bob.add(this.pivot); // Make sure the position is relative to the pendulum's origin

        stroke(0);
        strokeWeight(2);
        // Draw the arm
        line(this.pivot.x, this.pivot.y, this.bob.x, this.bob.y);
        fill(127);
        // Draw the ball
        circle(this.bob.x, this.bob.y, this.ballr * 2);
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
