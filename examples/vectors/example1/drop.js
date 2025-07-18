let drops = [];
let dropSounds = [];
let rainSlider;
let maxDrops = 100;

function preload() {
    soundFormats('mp3', 'ogg');
    dropSounds = [
        loadSound('drop1.mp3'),
        loadSound('drop2.mp3'),
        loadSound('drop3.mp3')
    ];
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    rainSlider = createSlider(1, 300, 10, 1);
    rainSlider.position(20, 20);
    rainSlider.style('width', '200px');
    for (let i = 0; i < maxDrops; i++) {
        drops.push(new Drop());
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background(20);
    // 슬라이더 값에 따라 비의 양 조절
    let targetCount = rainSlider.value();

    // drops 배열 길이 맞추기
    if (drops.length < targetCount) {
        for (let i = drops.length; i < targetCount; i++) {
            drops.push(new Drop());
        }
    } else if (drops.length > targetCount) {
        drops.length = targetCount;
    }

    for (let d of drops) {
        d.applyWind();
        d.update();
        d.show();
        if (d.pos.y > height) {
            if (dropSounds.length) {
                let s = random(dropSounds);
                if (s.isLoaded()) {
                    s.setVolume(random(0.5, 1));
                    s.play();
                }
            }
            d.reset();
        }
    }
    // 슬라이더 라벨
    noStroke();
    fill(220);
    textSize(16);
    text('비의 양: ' + targetCount, rainSlider.x * 2 + rainSlider.width, 35);
}

class Drop {
    constructor() {
        this.reset();
        this.lastWind = createVector(0, 0); // 마지막 바람 벡터
    }

    reset() {
        this.pos = createVector(random(width), random(-200, -50));
        this.vel = createVector(0, random(3, 7));
        this.acc = createVector();
        this.len = random(18, 32); // 빗방울 길이
        this.thick = random(1, 2.2); // 두께
        this.gray = random(120, 200); // 회색계열
    }

    applyWind() {
        let wind = createVector(noise(this.pos.y * 0.01, frameCount * 0.01) - 0.5, 0).mult(0.1);
        this.acc.add(wind);
        this.lastWind = wind.copy()
    }

    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    show() {
        stroke(this.gray, 180);
        strokeWeight(this.thick);
        // 빗방울 본체: 길쭉하게
        let tail = this.vel.copy().setMag(this.len);
        line(this.pos.x, this.pos.y, this.pos.x - tail.x, this.pos.y - tail.y);

        // 속도 벡터(회색)
        this.drawArrow(this.pos, this.vel.copy().setMag(18), color(250, 250, 250, 90));
        // 바람 벡터(파란색, 더 짧고 얇게)
        this.drawArrow(this.pos, this.lastWind.copy().setMag(16), color(80, 100, 255, 120), 0.6);
    }

    drawArrow(base, vec, myColor) {
        push();
        stroke(myColor);
        strokeWeight(0.8);
        fill(myColor);
        translate(base.x, base.y);
        line(0, 0, vec.x, vec.y);
        let arrowSize = 7;
        let angle = atan2(vec.y, vec.x);
        push();
        translate(vec.x, vec.y);
        rotate(angle);
        // 더 날카롭고 작은 화살촉
        triangle(0, 0, -arrowSize, arrowSize * 0.3, -arrowSize, -arrowSize * 0.3);
        pop();
        pop();
    }
}