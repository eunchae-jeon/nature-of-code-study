let ball;
let forces = [];
let forceCount = 3;
let forceSlider;
let isEquilibrium = true;
let unbalanceIndex = 0;

function setup() {
    createCanvas(windowWidth, 600);
    ball = new Ball(width / 2, height / 2);

    forceSlider = createSlider(2, 5, 3, 1);
    forceSlider.position(20, 20);
    forceSlider.style('width', '160px');

    setEquilibriumForces(forceSlider.value());
}

function draw() {
    background(30);

    // 슬라이더 값이 바뀌면 힘 개수 재설정
    if (forceCount !== forceSlider.value()) {
        forceCount = forceSlider.value();
        setEquilibriumForces(forceCount);
    }
    ball.display();

    // 힘 벡터 표시
    let sum = createVector(0, 0);
    for (let i = 0; i < forces.length; i++) {
        drawArrow(ball.pos, forces[i], color(255));
        sum.add(forces[i]);
    }

    // 합력 벡터 표시 (0이 아니면 빨간색)
    if (sum.mag() > 0) {
        drawArrow(ball.pos, sum, color(255, 80, 80), 3);
    }

    // 공에 합력 적용
    ball.applyForce(sum);
    ball.update();
}

// 클릭 시 평형/불균형 토글
function mousePressed() {
    if (mouseY < 0 || mouseY > height) return;
    isEquilibrium = !isEquilibrium;
    if (isEquilibrium) {
        setEquilibriumForces(forceCount);
    } else {
        // 완전히 새로운 벡터들로 재생성 (불균형)
        forces = [];
        let baseMag = random(30, 60);
        let angle0 = random(TWO_PI);
        for (let i = 0; i < forceCount; i++) {
            let angle = angle0 + i * TWO_PI / forceCount + random(-0.2, 0.2);
            let mag = baseMag * random(1.2, 1.7); // 더 세게
            forces.push(p5.Vector.fromAngle(angle).setMag(mag));
        }
    }
}

// 평형 상태의 힘들 생성
function setEquilibriumForces(n) {
    forces = [];
    let baseMag = random(30, 60);
    let angle0 = random(TWO_PI);
    for (let i = 0; i < n; i++) {
        let angle = angle0 + i * TWO_PI / n;
        let mag = baseMag * random(0.9, 1.1);
        forces.push(p5.Vector.fromAngle(angle).setMag(mag));
    }
    // 평형이 되도록 마지막 힘을 조정
    let sum = createVector(0, 0);
    for (let i = 0; i < n - 1; i++) sum.add(forces[i]);
    forces[n - 1] = sum.copy().mult(-1);
}

class Ball {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
    }

    applyForce(f) {
        this.acc.add(f.copy().mult(0.002)); // 힘이 너무 크지 않게 조절
    }

    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.set(0, 0);

        // 화면 밖으로 나가면 반대쪽에서 등장 (wrap)
        if (this.pos.x < 0) this.pos.x = width;
        if (this.pos.x > width) this.pos.x = 0;
        if (this.pos.y < 0) this.pos.y = height;
        if (this.pos.y > height) this.pos.y = 0;
    }

    display() {
        fill(200, 200);
        noStroke();
        ellipse(this.pos.x, this.pos.y, 40, 40);
    }
}

// 벡터 화살표 그리기
function drawArrow(base, vec, col, weight = 2) {
    push();
    stroke(col);
    strokeWeight(weight);
    fill(col);
    translate(base.x, base.y);
    line(0, 0, vec.x, vec.y);
    let arrowSize = 10 + constrain(vec.mag() * 0.1, 0, 12);
    let angle = atan2(vec.y, vec.x);
    push();
    translate(vec.x, vec.y);
    rotate(angle);
    triangle(0, 0, -arrowSize, arrowSize * 0.4, -arrowSize, -arrowSize * 0.4);
    pop();
    pop();
}