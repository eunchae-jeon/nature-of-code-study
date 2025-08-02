// n-body 문제 + 각 바디 쌍 사이에 3마디 IK로 연결된 선
// 한쪽 방향(시계/반시계)으로 도는 느낌을 위해 초기 속도와 중심력 적용

let bodies = [];
let ikLinks = [];
let n = 60; // 바디 개수
let G = 0.1; // 중력 상수
let linkCount = 2.5 * n; // IK 링크 개수 
let centripetalForce = 0.002 // 구심력
let center;
let bgStars = [];
let bgStarAngle = 0; // 배경 별 회전 각도

function setup() {
    createCanvas(800, 800);
    bodies = [];
    ikLinks = [];
    center = createVector(width / 2, height / 2);

    // 배경 별들 생성 (움직이지 않음)
    bgStars = [];
    for (let i = 0; i < 100; i++) {
        // 중심 기준 극좌표로 저장 (회전 효과용)
        let angle = random(TWO_PI);
        let dist = random(50, width * 0.8);
        let r = random(0.5, 1.8);
        let alpha = random(120, 255);
        let c = color(
            random(220, 255),
            random(220, 255),
            random(240, 255),
            alpha
        );
        bgStars.push({ angle, dist, r, c });
    }

    // 랜덤 각도와 거리로 배치하되, 각도에 수직인 방향으로 속도 부여
    for (let i = 0; i < n; i++) {
        let angle = random(TWO_PI);
        let distFromCenter = random(150, 450);
        let pos = p5.Vector.fromAngle(angle).mult(distFromCenter).add(center);

        // 각도에 수직인 방향(원운동)으로 속도
        let vel = p5.Vector.fromAngle(angle + HALF_PI).setMag(random(0.5, 1.2));
        let mass = random(5, 10);
        bodies.push(new Body(pos, mass, vel));
    }

    let connected = new Set();
    while (ikLinks.length < linkCount) {
        let i = floor(random(n));
        let j = floor(random(n));
        if (i !== j) {
            // 중복 연결 방지 (i-j, j-i 모두 체크)
            let key = i < j ? `${i}-${j}` : `${j}-${i}`;
            if (!connected.has(key)) {
                ikLinks.push(new IKLink(bodies[i], bodies[j]));
                connected.add(key);
            }
        }
    }
}

function draw() {
    background(10, 18, 32); // 밤하늘 느낌의 어두운 남색
    bgStarAngle += 0.0007; // 회전 속도 (값을 조절해보세요)
    noStroke();
    for (let s of bgStars) {
        // 극좌표 → 데카르트 변환 (중심 기준 회전)
        let a = s.angle + bgStarAngle;
        let x = center.x + cos(a) * s.dist;
        let y = center.y + sin(a) * s.dist;
        fill(s.c);
        ellipse(x, y, s.r, s.r);
    }

    // n-body 중력 계산 및 적용
    for (let i = 0; i < bodies.length; i++) {
        for (let j = 0; j < bodies.length; j++) {
            if (i !== j) {
                let force = bodies[j].pos.copy().sub(bodies[i].pos);
                let dist = constrain(force.mag(), 40, 300);
                force.setMag((G * bodies[i].mass * bodies[j].mass) / (dist * dist));
                bodies[i].applyForce(force);
            }
        }
        // 중심으로 약한 구심력
        let toCenter = p5.Vector.sub(center, bodies[i].pos);
        toCenter.setMag(centripetalForce * bodies[i].mass);
        bodies[i].applyForce(toCenter);
    }

    // 바디 업데이트 및 그리기
    for (let b of bodies) {
        b.update();
        b.display();
    }

    // IK 링크 업데이트 및 그리기
    for (let link of ikLinks) {
        link.update();
        link.display();
    }
}

// 바디 클래스
class Body {
    constructor(pos, mass, vel = createVector(0, 0)) {
        this.pos = pos.copy();
        this.vel = vel.copy();
        this.acc = createVector(0, 0);
        this.mass = mass;
        this.r = 3.5; // 별처럼 작게
        // 별자리 느낌의 밝은 흰색~파란색~노란색 계열
        let starColors = [
            color(235, 245, 255, 250), // 푸른빛 흰색
            color(210, 225, 255, 240), // 연한 파랑
            color(255, 255, 245, 250), // 따뜻한 흰색
            color(255, 255, 255, 255), // 순백
            color(180, 210, 255, 220), // 더 푸른 별
            color(255, 245, 200, 240), // 연노랑
        ];
        this.col = random(starColors);
    }

    applyForce(f) {
        this.acc.add(p5.Vector.div(f, this.mass));
    }

    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    display() {
        // 별 주변에 은은한 빛 효과 (겹 수와 투명도 줄임)
        for (let i = 3; i >= 1; i--) {
            let glowAlpha = map(i, 1, 4, 15, 15 - i * 5);
            let glowRadius = this.r * (1 + i * 1.5);
            fill(red(this.col), green(this.col), blue(this.col), glowAlpha);
            noStroke();
            ellipse(this.pos.x, this.pos.y, glowRadius, glowRadius);
        }
        noStroke();
        fill(this.col);
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
        // 별빛 효과
        if (random() < 0.01) {
            fill(this.col, 100);
            ellipse(this.pos.x, this.pos.y, this.r * 2.5, this.r * 2.5);
        }
    }
}

class IKLink {
    constructor(bodyA, bodyB) {
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.segs = floor(random(2, 5)); // 2~4마디
        this.lengths = Array.from({ length: this.segs }, () => random(20, 50));
        this.angles = [0, 0, 0];
        this.points = [bodyA.pos.copy(), createVector(), createVector(), bodyB.pos.copy()];
        this.segsColors = Array.from({ length: this.segs + 1 }, () => {
            return color(random(200, 240), random(200, 240), random(240, 255), random(180, 240));
        });
        // 각 세그먼트의 색상을 랜덤하게 섞음
        this.segsColors = this.segsColors.sort(() => random() - 0.5);
        this.segsRadius = Array.from({ length: this.segs + 1 }, () => random(1, 6));
    }

    update() {
        this.points[this.segs] = this.bodyB.pos.copy();
        for (let i = this.segs - 1; i >= 0; i--) {
            let dir = p5.Vector.sub(this.points[i + 1], this.points[i]);
            let angle = dir.heading();
            this.angles[i] = angle;
            this.points[i] = p5.Vector.add(this.points[i + 1], p5.Vector.fromAngle(angle + PI).mult(this.lengths[i]));
        }
        this.points[0] = this.bodyA.pos.copy();
        for (let i = 0; i < this.segs; i++) {
            this.points[i + 1] = p5.Vector.add(this.points[i], p5.Vector.fromAngle(this.angles[i]).mult(this.lengths[i]));
        }
    }

    display() {
        // 두 바디가 충분히 가까울 때만 IK 선을 그림
        let dist = p5.Vector.dist(this.bodyA.pos, this.bodyB.pos);
        let maxLen = this.lengths.reduce((a, b) => a + b, 0);
        if (dist > maxLen) return;

        strokeWeight(2.1); // 얇게
        noFill();
        for (let i = 0; i < this.segs; i++) {
            stroke(color(255, 255, 255, 80)); // 연한 흰색

            line(this.points[i].x, this.points[i].y, this.points[i + 1].x, this.points[i + 1].y);
        }
        // 관절은 작고 밝게
        for (let i = 0; i <= this.segs; i++) {
            noStroke();
            fill(this.segsColors[i % this.segsColors.length], 200);
            ellipse(this.points[i].x, this.points[i].y, this.segsRadius[i % this.segsRadius.length], this.segsRadius[i % this.segsRadius.length]);
        }
    }
}