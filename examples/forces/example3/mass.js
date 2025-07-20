let fan;
let balls = [];
let blowing = false;

function setup() {
    createCanvas(700, 300);
    // 팬(선풍기) 위치
    fan = new Fan(40, height / 2);

    // 두 물체: 탁구공(가벼움), 쇠구슬(무거움)
    balls = [
        new Ball(180, height / 2, 1, color(255, 255, 255)),
        new Ball(180, height / 2 + 60, 8, color(180, 180, 200))
    ];
}

function draw() {
    background(30);

    // 팬 그리기
    fan.display();

    // 바람 이펙트
    if (blowing) {
        fan.blowEffect();
    }

    // 각 공에 힘 적용 및 그리기
    for (let b of balls) {
        if (blowing) {
            // 동일한 힘을 옆에서 가함
            let wind = createVector(0.18, 0);
            b.applyForce(wind);
        }
        b.update();
        b.display();
    }
}

function mousePressed() {
    blowing = !blowing;
}

class Fan {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
    }

    display() {
        // 팬 몸체
        push();
        translate(this.x, this.y);
        fill(120, 140, 180);
        ellipse(0, 0, 60, 60);
        // 팬 날개
        for (let i = 0; i < 3; i++) {
            push();
            rotate(this.angle + i * TWO_PI / 3);
            fill(200, 220, 255, 180);
            ellipse(18, 0, 28, 12);
            pop();
        }
        pop();

        // 팬 받침대
        fill(100, 110, 130);
        rect(this.x - 14, this.y + 30, 28, 12, 4);

        // 팬 회전
        if (blowing) this.angle += 0.25;
    }

    blowEffect() {
        // 바람 이펙트: 반투명 곡선 (높이 더 넓게)
        for (let i = 0; i < 10; i++) { // 곡선 개수도 늘림
            let yoff = map(i, 0, 9, -80, 80); // 높이 범위 확장
            let alpha = map(i, 0, 9, 60, 10);
            noFill();
            stroke(120, 180, 255, alpha);
            strokeWeight(3);
            beginShape();
            for (let x = this.x + 30; x < width - 40; x += 18) {
                let y = this.y + yoff + sin(x * -0.04 + frameCount * 0.08 + i) * 8;
                curveVertex(x, y);
            }
            endShape();
        }
    }
}

class Ball {
    constructor(x, y, m, c, label) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.mass = m;
        this.color = c;
        this.label = label;
    }

    applyForce(f) {
        // F = m * a → a = F / m
        let a = p5.Vector.div(f, this.mass);
        this.acc.add(a);
    }

    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.set(0, 0);

        // 오른쪽 벽에 닿으면 반대 방향 같은 속도로 튕김
        if (this.pos.x > width - 20) {
            this.pos.x = width - 20;
            this.vel.x *= -1;
        }
        // 왼쪽 벽에 닿으면 반대 방향 같은 속도로 튕김
        if (this.pos.x < 20) {
            this.pos.x = 20;
            this.vel.x *= -1;
        }
    }

    display() {
        // 쇠구슬(두 번째 공)만 반짝임 효과
        if (this.mass > 2) {
            // 메탈릭 그라데이션
            let grad = drawingContext.createRadialGradient(
                this.pos.x - 8, this.pos.y - 8, 4,
                this.pos.x, this.pos.y, 20
            );
            grad.addColorStop(0, "#ffffffcc");
            grad.addColorStop(0.3, "#b0b0c0cc");
            grad.addColorStop(0.7, "#888899cc");
            grad.addColorStop(1, "#444455cc");
            drawingContext.save();
            drawingContext.beginPath();
            drawingContext.arc(this.pos.x, this.pos.y, 20, 0, Math.PI * 2);
            drawingContext.closePath();
            drawingContext.fillStyle = grad;
            drawingContext.fill();
            drawingContext.restore();

            // 반짝이는 하이라이트
            noStroke();
            fill(255, 255, 255, 120);
            ellipse(this.pos.x - 7, this.pos.y - 7, 10, 6);
            fill(255, 255, 255, 60);
            ellipse(this.pos.x + 4, this.pos.y + 5, 6, 3);
        } else {
            let grad = drawingContext.createRadialGradient(
                this.pos.x - 6, this.pos.y - 6, 2,
                this.pos.x, this.pos.y, 20
            );
            grad.addColorStop(0, "#ffffffee");
            grad.addColorStop(0.7, "#ffffefb0");
            grad.addColorStop(1, "#ffffefa0");
            drawingContext.save();
            drawingContext.beginPath();
            drawingContext.arc(this.pos.x, this.pos.y, 20, 0, Math.PI * 2);
            drawingContext.closePath();
            drawingContext.fillStyle = grad;
            drawingContext.fill();
            drawingContext.restore();


            // 곡면 느낌의 연한 곡선
            noFill();
            stroke(255, 180, 80, 60);
            strokeWeight(2);
            arc(this.pos.x, this.pos.y, 32, 32, PI / 4, PI / 1.1);

        }
    }
}
