let rocket;
let fuels = [];

function setup() {
    createCanvas(400, 600);
    rocket = new Rocket(width / 2, height - 80);
}

function draw() {
    background(20);
    // 발사대(로켓 아래에 고정)
    drawLauncher();
    // 연료(배기) 처리
    for (let i = fuels.length - 1; i >= 0; i--) {
        fuels[i].update();
        fuels[i].display();
        if (fuels[i].r < 2) fuels.splice(i, 1);
    }

    // 로켓
    rocket.update();
    rocket.display();

    // 안내
    fill(220);
    noStroke();
    // textSize(16);
    // textAlign(CENTER);
    // text("마우스 클릭: 연료 분사(작용), 로켓 상승(반작용)", width / 2, 30);
}

function mousePressed() {
    rocket.thrusting = true;
}
function mouseReleased() {
    rocket.thrusting = false;
}
class Rocket {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.thrusting = false;
    }

    update() {
        if (this.thrusting) {
            // 아래로 연료 분출(작용)
            for (let i = 0; i < 2; i++) {
                let fuel = new Fuel(this.pos.x, this.pos.y + 40, random(-1, 1), random(5, 8));
                fuels.push(fuel);
            }

            // 위로 힘 받음(반작용)
            this.applyForce(createVector(0, -0.12));
        }
        // 중력
        this.applyForce(createVector(0, 0.08));

        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.set(0, 0);

        // 바닥에 닿으면 멈춤
        if (this.pos.y > height - 60) {
            this.pos.y = height - 60;
            this.vel.y = 0;
        }
    }

    applyForce(f) {
        this.acc.add(f);
    }

    display() {
        // 로켓 본체
        push();
        translate(this.pos.x, this.pos.y);
        rectMode(CENTER);
        fill(180, 200, 255);
        rect(0, 0, 30, 80, 8);
        // 로켓 뚜껑(위쪽에 삼각형)
        fill(200, 80, 80);
        triangle(-15, -40, 15, -40, 0, -60);
        pop();
    }
}

class Fuel {
    constructor(x, y, vx, vy) {
        this.pos = createVector(x, y);
        this.vel = createVector(vx, vy);
        this.r = random(14, 22);
        // 연료 색상을 랜덤으로 지정 (노랑, 주황, 빨강, 연보라 등)
        const colors = [
            [255, 180, 80, 180],
            [255, 120, 60, 180],
            [255, 80, 80, 180],
            [200, 120, 255, 180],
            [255, 255, 120, 180],
            [80, 180, 255, 180],    // 파란색 연료 추가
        ];
        this.color = random(colors);
    }

    update() {
        this.pos.add(this.vel);
        this.vel.y += 0.1; // 중력
        this.r *= 0.93; // 점점 작아짐
    }

    display() {
        noStroke();
        fill(...this.color);
        ellipse(this.pos.x, this.pos.y, this.r, this.r);
    }
}

function drawLauncher() {
    // 발사대 본체
    let baseX = rocket.pos.x;
    let baseY = height - 10;
    fill(100, 100, 120);
    rectMode(CENTER);
    rect(baseX, baseY, 60, 18, 4);

    // 발사대 기둥
    fill(130, 130, 150);
    rect(baseX - 25, baseY - 65, 8, 120, 3);

    // 발사대 바닥 그림자
    fill(60, 60, 80, 80);
    ellipse(baseX, baseY + 7, 50, 12);
}