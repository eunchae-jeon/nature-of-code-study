let box, inclineAngle, inclineLength, frictionCoef;
let gravity = 0.5;
let handleRadius = 18;
let handleDragging = false;

function setup() {
    createCanvas(600, 400);
    inclineAngle = PI / 6; // 30도
    inclineLength = 320;
    frictionCoef = 0.35; // 마찰계수

    // 박스 초기 위치를 빗면 위에서 살짝 띄워서 시작
    box = new Box(inclineLength - 60, 60, 40); // 기존과 동일
    box.heightOffset = 18; // 박스를 빗면에서 평행하게 살짝 올림
}

// 상자 클래스
class Box {
    constructor(pos, w, h) {
        this.w = w;
        this.h = h;
        this.mass = 1;
        this.pos = pos; // 빗면 위 거리
        this.vel = 0;
        this.acc = 0;
    }
    show() {
        fill(220, 180, 120);
        stroke(120);
        strokeWeight(2);
        // 박스를 빗면에서 평행하게 살짝 올림
        rect(-this.w / 2, -this.h / 2 - (this.heightOffset || 0), this.w, this.h, 8);
    }
}

// 힘 벡터 그리기
function drawForceArrow(baseX, baseY, mag, label, col, angle, reverse = false, normal = false) {
    push();
    translate(0, 0); // 이미 box 위치로 이동됨
    rotate(angle);
    stroke(col);
    strokeWeight(3);
    let dir = reverse ? -1 : 1;
    let yOffset = normal ? 0 : -40;
    let x = dir * mag * 40;
    let y = yOffset;
    line(0, yOffset, x, y);
    fill(col);
    noStroke();
    let arrowBase = createVector(x, y);
    let left = p5.Vector.add(arrowBase, p5.Vector.fromAngle(PI * 0.75).mult(10));
    let right = p5.Vector.add(arrowBase, p5.Vector.fromAngle(-PI * 0.75).mult(10));
    triangle(arrowBase.x, arrowBase.y, left.x, left.y, right.x, right.y);
    textSize(15);
    textAlign(CENTER, BOTTOM);
    text(label, x, y - 15);
    pop();
}
function drawCat(w, h) {
    push();
    translate(0, -44); // 고양이만 박스 위로 올림 (적당히 조절)
    // 몸통
    fill(220, 220, 220);
    ellipse(0, h * 0.1, w * 0.7, h * 0.45);
    // 머리
    fill(220, 220, 220);
    ellipse(-w * 0.22, -h * 0.18, w * 0.32, h * 0.32);
    // 귀
    fill(220, 220, 220);
    triangle(-w * 0.32, -h * 0.32, -w * 0.22, -h * 0.32, -w * 0.27, -h * 0.18);
    triangle(-w * 0.12, -h * 0.32, -w * 0.22, -h * 0.32, -w * 0.17, -h * 0.18);
    // 꼬리
    stroke(220, 220, 220);
    strokeWeight(8);
    noFill();
    beginShape();
    curveVertex(w * 0.22, h * 0.12);
    curveVertex(w * 0.22, h * 0.12);
    curveVertex(w * 0.32, h * 0.22);
    curveVertex(w * 0.18, h * 0.32);
    curveVertex(w * 0.08, h * 0.22);
    endShape();
    noStroke();
    // 얼굴 무늬
    fill(180, 180, 180);
    ellipse(-w * 0.22, -h * 0.18, w * 0.12, h * 0.12);
    // 몸통 무늬
    fill(180, 180, 180);
    ellipse(0, h * 0.1, w * 0.18, h * 0.18);
    // 눈
    fill(40);
    ellipse(-w * 0.25, -h * 0.18, w * 0.05, h * 0.05);
    ellipse(-w * 0.19, -h * 0.18, w * 0.05, h * 0.05);
    // 코
    fill(255, 180, 180);
    ellipse(-w * 0.22, -h * 0.13, w * 0.03, h * 0.02);
    // 입
    stroke(80, 60, 40);
    strokeWeight(2);
    line(-w * 0.22, -h * 0.12, -w * 0.22, -h * 0.10);
    line(-w * 0.22, -h * 0.10, -w * 0.24, -h * 0.09);
    line(-w * 0.22, -h * 0.10, -w * 0.20, -h * 0.09);
    noStroke();
    pop();
}

function draw() {
    background(245);

    // 빗면 위치를 아래쪽 중앙으로 조정 + 살짝 올림
    let baseX = width / 2 - inclineLength / 2;
    let baseY = height - 120;
    let topX = baseX + inclineLength * cos(inclineAngle);
    let topY = baseY - inclineLength * sin(inclineAngle);

    stroke(120);
    strokeWeight(6);
    line(baseX, baseY, topX, topY);

    // 빗면 끝 손잡이
    push();
    fill(handleDragging ? color(255, 180, 80) : color(180, 220, 255));
    stroke(120);
    strokeWeight(2);
    ellipse(topX, topY, handleRadius * 2);
    pop();

    // 상자에 작용하는 힘 계산
    let m = box.mass;
    let g = gravity;
    let theta = inclineAngle;

    let Fg = m * g;
    let Fg_parallel = -Fg * sin(theta); // 빗면 방향 (아래)
    let Fg_perp = -Fg * cos(theta);     // 빗면 수직 방향 (아래)
    let normal = -Fg_perp;              // 수직항력 (빗면 위쪽)
    let frictionMax = frictionCoef * abs(normal);

    // 마찰력 (정지/운동)
    let friction;
    if (abs(box.vel) < 0.01 && abs(Fg_parallel) < frictionMax) {
        friction = -Fg_parallel; // 정지 마찰: 진행방향 반대
        box.acc = 0;
    } else {
        friction = frictionMax * (box.vel > 0 ? -1 : 1); // 운동 마찰: 진행방향 반대
        box.acc = (Fg_parallel + friction) / m;
    }

    // 상자 위치/속도 업데이트 (빗면 방향으로만)
    box.vel += box.acc;
    box.vel *= 0.99;
    box.pos += box.vel;
    box.pos = constrain(box.pos, 0, inclineLength - box.w / 2);

    // 상자 중심 좌표
    let boxX = baseX + box.pos * cos(inclineAngle);
    let boxY = baseY - box.pos * sin(inclineAngle);

    push();
    translate(boxX, boxY);
    rotate(-inclineAngle);
    box.show();
    drawCat(box.w, box.h);

    // --- 힘 벡터 시각화 (박스 중심 기준) ---
    // ...박스 중심에서 힘 벡터 시각화 부분...
    // 중력의 빗면방향
    let gravityDir = Fg_parallel > 0 ? 0 : PI;
    drawVector(0, 0, abs(Fg_parallel), gravityDir, "F_gravity", color(80, 160, 255));
    // 마찰력: 항상 중력 빗면방향의 반대
    let frictionDir = Fg_parallel > 0 ? PI : 0;
    drawVector(0, 0, abs(friction), frictionDir, "F_friction", color(255, 120, 80));

    // 수직항력 (빗면과 수직 위쪽)
    drawVector(0, 0, abs(normal / 2), -HALF_PI, "F_normal", color(120, 200, 120));
    pop();
}

// 박스 중심에서 출발하는 벡터 그리기
function drawVector(x, y, mag, angle, label, col) {
    push();
    // 박스 중심에서 시작하도록 (박스 show/고양이와 동일하게 y축 올림)
    translate(0, -(box.heightOffset || 0));
    stroke(col);
    strokeWeight(3);
    let scale = 400; // 10배 과장
    let vx = mag * scale * cos(angle);
    let vy = mag * scale * sin(angle);
    line(x, y, x + vx, y + vy);
    fill(col);
    noStroke();
    // 값이 충분히 크면 화살표 헤드 그리기
    if (abs(mag) > 0.001) {
        let arrowBase = createVector(x + vx, y + vy);
        let left = p5.Vector.add(arrowBase, p5.Vector.fromAngle(angle + PI * 0.75).mult(10));
        let right = p5.Vector.add(arrowBase, p5.Vector.fromAngle(angle - PI * 0.75).mult(10));
        triangle(arrowBase.x, arrowBase.y, left.x, left.y, right.x, right.y);
    }
    textSize(15);
    textAlign(CENTER, BOTTOM);
    text(label, x + vx, y + vy - 15);
    pop();
}

function mousePressed() {
    let baseX = width / 2 - inclineLength / 2;
    let baseY = height - 120; // 위치 맞춰서 수정
    let topX = baseX + inclineLength * cos(inclineAngle);
    let topY = baseY - inclineLength * sin(inclineAngle);
    if (dist(mouseX, mouseY, topX, topY) < handleRadius) {
        handleDragging = true;
    }
}

function mouseDragged() {
    if (handleDragging) {
        let baseX = width / 2 - inclineLength / 2;
        let baseY = height - 120; // 위치 맞춰서 수정
        let dx = mouseX - baseX;
        let dy = mouseY - baseY;
        inclineAngle = atan2(-dy, dx);
        inclineAngle = constrain(inclineAngle, radians(5), radians(80));
    }
}

function mouseReleased() {
    handleDragging = false;
}

function keyPressed() {
    if (key === 'r' || key === 'R') {
        box.pos = inclineLength - 60;
        box.vel = 0;
        box.acc = 0;
    }
}