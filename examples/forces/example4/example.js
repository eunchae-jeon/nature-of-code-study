let hands = [];
let balls = [];
let gridCols = 7;
let gridRows = 4;
let handSize = 0.55; // 크기 비율
let ballColors = [];
let handColors = []; // 손이 잡고 있는 공의 색상 저장
let particles = [];
let bgWave = 0;
let bgWaveColor;


function setup() {
    createCanvas(900, 500);
    bgWaveColor = color(24);
    hands = [];
    // 바둑판식으로 손 배치
    for (let i = 0; i < gridCols; i++) {
        for (let j = 0; j < gridRows; j++) {
            let x = map(i, 0, gridCols - 1, 70, width - 70);
            let y = map(j, 0, gridRows - 1, 60, height - 60);
            let baseAngle = random([-PI / 2, PI / 2]);
            hands.push(new IKHand(x, y, baseAngle, handSize));
        }
    }
    // 여러 개의 진한 색 공 생성 (갯수와 색상 다양화)
    balls = [];
    ballColors = [];
    let ballCount = 4; // 공 갯수 증가
    for (let i = 0; i < ballCount; i++) {
        let angle = map(i, 0, ballCount, 0, TWO_PI);
        let r = 14;
        let x = width / 2 + cos(angle) * random(120, 260) + random(-40, 40);
        let y = height / 2 + sin(angle) * random(60, 160) + random(-30, 30);
        balls.push(new Ball(x, y, r));
        // 다양한 진한 색상 (HSV 변환 활용)
        let hue = map(i, 0, ballCount, 0, 360) + random(-20, 20);
        colorMode(HSL, 360, 100, 100, 255);
        let c = color(hue % 360, random(50, 75), random(40, 60), 255);
        colorMode(RGB, 255);
        ballColors.push(c);
    }
    handColors = new Array(hands.length).fill(color(255, 220));
}

function draw() {
    // 배경 파동 효과
    if (bgWave > 0.01) {
        // 파동이 있을 때만 배경에 컬러 overlay
        let alpha = map(bgWave, 0, 1, 0, 120);
        background(lerpColor(color(24), bgWaveColor, bgWave), alpha);
        bgWave *= 0.93;
    } else {
        background(24);
        bgWave = 0;
    }

    // 파티클 업데이트/그리기
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].display();
        if (particles[i].isDead()) particles.splice(i, 1);
    }

    // 손이 공에 힘을 가함
    for (let ball of balls) {
        for (let hand of hands) {
            let tip = hand.points[hand.segs];
            let d = p5.Vector.dist(tip, ball.pos);
            if (d < ball.r + 18) {
                let push = p5.Vector.sub(ball.pos, tip).setMag(0.7 * (ball.r + 18 - d) / (ball.r + 18));
                ball.applyForce(push);
            }
        }
    }

    // 공 움직임
    for (let i = 0; i < balls.length; i++) {
        balls[i].update();
        balls[i].display(ballColors[i]);
    }

    // 손들 업데이트 및 그리기 (각 손은 가까운 공을 목표로)
    for (let h = 0; h < hands.length; h++) {
        let hand = hands[h];
        let nearest = getNearestBall(hand.base, balls);
        hand.update(nearest.pos);

        // 손이 잡고 있는 공이 있으면 그 공의 색으로, 아니면 기본색
        let grabbedColor = null;
        let grabbedBallIdx = -1;
        let grabbedPalmIdx = -1;
        for (let i = 0; i < hand.fingerCount; i++) {
            let palm = hand.palmEnds[i];
            for (let b = 0; b < balls.length; b++) {
                let d = p5.Vector.dist(palm, balls[b].pos);
                if (d < balls[b].r + 10) {
                    grabbedColor = ballColors[b];
                    grabbedBallIdx = b;
                    grabbedPalmIdx = i;
                    break;
                }
            }
            if (grabbedColor) break;
        }
        if (grabbedColor) {
            handColors[h] = lerpColor(color(255, 220), grabbedColor, 0.5);
        } else {
            handColors[h] = color(255, 220);
        }

        // 파티클 효과: 손가락 끝에서 공 색상 파티클 생성
        if (grabbedColor && grabbedPalmIdx !== -1) {
            let finger = hand.fingers[grabbedPalmIdx];
            let tip = finger.points[finger.segs];
            for (let p = 0; p < 3; p++) { // 여러 개 생성
                let angle = random(TWO_PI);
                let speed = random(1, 2.5);
                let vel = p5.Vector.fromAngle(angle).mult(speed);
                particles.push(new Particle(tip.x, tip.y, vel, grabbedColor));
            }
            // // 배경 파동 효과 트리거
            // bgWave = 0.1;
            // bgWaveColor = grabbedColor;
        }

        hand.display(nearest.pos, handColors[h]);
    }
}
// 공 클래스
class Ball {
    constructor(x, y, r) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D().mult(1.7);
        this.r = r;
        this.acc = createVector(0, 0);
    }

    applyForce(f) {
        this.acc.add(f);
    }

    update() {
        this.vel.add(this.acc);
        this.vel.limit(4); // 속도 제한
        this.pos.add(this.vel);
        this.acc.mult(0);

        // 벽 반사
        if (this.pos.x < this.r) {
            this.pos.x = this.r;
            this.vel.x *= -1;
        }
        if (this.pos.x > width - this.r) {
            this.pos.x = width - this.r;
            this.vel.x *= -1;
        }
        if (this.pos.y < this.r) {
            this.pos.y = this.r;
            this.vel.y *= -1;
        }
        if (this.pos.y > height - this.r) {
            this.pos.y = height - this.r;
            this.vel.y *= -1;
        }

        // 마찰
        this.vel.mult(0.985);
    }

    display(c = color(220, 80, 80, 220)) {
        noStroke();
        fill(c);
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    }
}

class IKHand {
    constructor(x, y, baseAngle, scale = 1) {
        this.base = createVector(x, y);
        this.baseAngle = baseAngle;
        this.segs = 3;
        this.lengths = [60, 48, 38].map(l => l * scale);
        this.angles = [baseAngle, baseAngle, baseAngle];
        this.points = [this.base.copy(), this.base.copy(), this.base.copy(), this.base.copy()];
        this.fingerCount = 3;
        this.fingers = [];
        for (let i = 0; i < this.fingerCount; i++) {
            let finger = new Finger(baseAngle, scale);
            finger.fingerIndex = i;
            finger.parentFingerCount = this.fingerCount;
            this.fingers.push(finger);
        }
        this.palmEnds = [];
    }

    update(target) {
        // 인버스 키네마틱: 손끝이 공을 향하도록 FABRIK 방식(간단)
        let pts = [];
        pts[this.segs] = target.copy();
        for (let i = this.segs - 1; i >= 0; i--) {
            let dir = p5.Vector.sub(pts[i + 1], this.points[i]);
            let angle = dir.heading();
            this.angles[i] = lerpAngle(this.angles[i], angle, 0.22);
            pts[i] = p5.Vector.add(pts[i + 1], p5.Vector.fromAngle(this.angles[i] + PI).mult(this.lengths[i]));
        }
        // base에서 forward kinematics로 위치 재계산
        this.points[0] = this.base.copy();
        for (let i = 0; i < this.segs; i++) {
            this.points[i + 1] = p5.Vector.add(this.points[i], p5.Vector.fromAngle(this.angles[i]).mult(this.lengths[i]));
        }

        // 손바닥 끝 위치 계산 (손가락 시작점)
        let spread = PI / 2.2;
        this.palmEnds = [];
        for (let i = 0; i < this.fingerCount; i++) {
            let angle = map(i, 0, this.fingerCount - 1, -spread / 2, spread / 2) + this.angles[0];
            let palmEnd = p5.Vector.add(this.points[this.segs], p5.Vector.fromAngle(angle).mult(this.lengths[0] * 0.38));
            this.palmEnds.push(palmEnd);
        }

        // 공이 손끝에 실제로 닿을 때만 grab
        for (let i = 0; i < this.fingerCount; i++) {
            let palm = this.palmEnds[i];
            let grab = 0;
            for (let ball of balls) {
                let d = p5.Vector.dist(palm, ball.pos);
                if (d < ball.r + 10) { // 손가락이 실제로 닿으면 grab
                    grab = 1;
                    break;
                }
            }
            this.fingers[i].update(palm, target, grab);
        }
    }

    display(target, handColor = color(255, 220)) {
        // 팔
        for (let i = 0; i < this.segs; i++) {
            strokeWeight(7);
            stroke(handColor);
            line(this.points[i].x, this.points[i].y, this.points[i + 1].x, this.points[i + 1].y);
            // 마디 관절
            noStroke();
            fill(handColor);
            ellipse(this.points[i].x, this.points[i].y, 12, 12);
        }
        // 손끝
        fill(handColor);
        ellipse(this.points[this.segs].x, this.points[this.segs].y, 10, 10);

        // 손가락
        for (let finger of this.fingers) {
            finger.display(handColor);
        }
    }
}

class Finger {
    constructor(baseAngle, scale = 1) {
        this.segs = 2;
        this.lengths = [18, 13].map(l => l * scale);
        this.baseAngle = baseAngle;
        this.angles = [baseAngle, baseAngle, baseAngle];
        this.targetAngles = [baseAngle, baseAngle, baseAngle];
        this.points = [createVector(), createVector(), createVector(), createVector()];
    }

    update(base, target, grab) {
        // 손가락 각도: 가운데는 공 방향, 양쪽은 벌어지게
        let dir = p5.Vector.sub(target, base).heading();
        let spread = PI / 7;
        let idx = this.fingerIndex !== undefined ? this.fingerIndex : 0;
        let offset = 0;
        if (this.parentFingerCount !== undefined) {
            offset = map(idx, 0, this.parentFingerCount - 1, -spread, spread);
        }
        let angle = dir + offset;

        // grab이 1일 때만 안쪽으로 구부러짐
        let bend = grab > 0.5 ? PI / 2.2 : 0;
        let angles = [angle, angle + bend];

        // 마디 길이(그랩 시 짧아짐)
        let lengths = this.lengths.map(l => lerp(l, l * 0.35, grab));

        this.angles = angles;
        this.points[0] = base.copy();
        for (let i = 0; i < this.segs; i++) {
            let prev = this.points[i];
            let next = p5.Vector.add(prev, p5.Vector.fromAngle(this.angles[i]).mult(lengths[i]));
            this.points[i + 1] = next;
        }
    }

    display(handColor = color(255, 220)) {
        for (let i = 0; i < this.segs; i++) {
            stroke(handColor);
            strokeWeight(3);
            line(this.points[i].x, this.points[i].y, this.points[i + 1].x, this.points[i + 1].y);
            // 관절
            noStroke();
            fill(handColor);
            ellipse(this.points[i + 1].x, this.points[i + 1].y, 7, 7);
        }
    }
}

// 파티클 클래스
class Particle {
    constructor(x, y, vel, c) {
        this.pos = createVector(x, y);
        this.vel = vel.copy();
        this.acc = createVector(0, 0.04);
        this.lifespan = 60 + random(20);
        this.color = c;
        this.r = random(3, 7);
    }

    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.lifespan -= 2;
    }

    display() {
        noStroke();
        fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], map(this.lifespan, 0, 80, 0, 180));
        ellipse(this.pos.x, this.pos.y, this.r, this.r);
    }

    isDead() {
        return this.lifespan < 0;
    }
}
// 가장 가까운 공 반환
function getNearestBall(pos, balls) {
    let minD = 99999;
    let nearest = null;
    for (let ball of balls) {
        let d = p5.Vector.dist(pos, ball.pos);
        if (d < minD) {
            minD = d;
            nearest = ball;
        }
    }
    return nearest;
}

// 각도 보간 함수
function lerpAngle(a, b, t) {
    let d = b - a;
    while (d > PI) d -= TWO_PI;
    while (d < -PI) d += TWO_PI;
    return a + d * t;
}