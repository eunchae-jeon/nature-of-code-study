let pendulums = [];
let colors = [];
let synths = [];
let num = 16;

// 무지개색 배열 생성 (HSV → RGB)
function rainbowColors(n) {
    colorMode(HSB);
    let arr = [];
    for (let i = 0; i < n; i++) {
        let hue = map(i, 0, n, 0, 255);
        arr.push(color(hue, 200, 230)); // s, b 값은 0~255 범위
    }
    colorMode(RGB); // 원래대로 돌려놓기
    return arr;
}
function setup() {
    createCanvas(600, 600);
    colors = rainbowColors(num);
    for (let i = 0; i < num; i++) {
        let len = 40 + i * 20;
        let period = 3000 / (i + 10); // 주기: i에 따라 다르게 설정
        pendulums.push(new Pendulum(width / 2, 80, len, period, colors[i]));
        synths.push(new Tone.Synth({
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.2, release: 0.3 },
            volume: -18
        }).toDestination());
    }
    // background(30, 30, 40);
}

function draw() {
    background(30, 30, 40, 99);

    // 가운데 수직선 기본 색
    let verticalColor = color(180, 180, 200, 120);

    // 진자가 수직선과 교차한 프레임에 해당 진자 색으로 변경
    let hitColor = null;
    for (let i = 0; i < pendulums.length; i++) {
        let p = pendulums[i];
        p.update();
        p.show();

        let prevX = p.prevBobX || p.bob.x;
        if ((prevX - width / 2) * (p.bob.x - width / 2) < 0) {
            let freq = 220 + i * 60;
            synths[i].triggerAttackRelease(freq, "8n");
            p.lastHit = millis();
            hitColor = p.color; // 교차한 진자 색 저장
        }
        p.prevBobX = p.bob.x;
    }

    // 수직선 그리기 (교차시 해당 진자 색으로)
    stroke(hitColor ? hitColor : verticalColor);
    strokeWeight(3);
    line(width / 2, 0, width / 2, height);
}

class Pendulum {
    // angle 대신 period(주기, 프레임 단위)로 받음
    constructor(x, y, r, period, color) {
        this.pivot = createVector(x, y);
        this.bob = createVector();
        this.r = r;
        this.period = period; // 진자의 주기 (프레임 단위)
        this.phase = 0; // 시작 위상
        this.ballr = 6.0;
        this.color = color;
    }

    update() {
        // 단순 주기 운동: sin/cos 기반
        // t: 프레임 카운트
        let t = frameCount;
        // 각도: 주기에 맞춰 -PI/2 ~ PI/2 범위로 왕복
        this.angle = PI / 4 * sin(TWO_PI * (t / this.period) + this.phase);
    }

    show() {
        // 진자 끝점 계산
        let bobX = this.pivot.x + this.r * sin(this.angle);
        let bobY = this.pivot.y + this.r * cos(this.angle);
        this.bob.set(bobX, bobY, 0);

        // 팔(arm) 연하게
        stroke(180, 180, 200, 40);
        strokeWeight(2);
        line(this.pivot.x, this.pivot.y, this.bob.x, this.bob.y);

        // 추(ball)
        fill(this.color);
        noStroke();
        ellipse(this.bob.x, this.bob.y, this.ballr * 2);
    }
}

function keyPressed() {
    if (key === ' ') Tone.start();
}