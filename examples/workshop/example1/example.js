const cols = 30;
const rows = 30;
const cellSize = 20;

let grid = [];
let step = 1;
let deers = [];
let lions = [];
let deerHunger = 3;
let deerReproduce = 5;
let lionHunger = 3;
let lionReproduce = 5;
let countGrassNeighbors = 3;


function setup() {
  createCanvas(cols * cellSize, rows * cellSize);
  frameRate(10);

  const grassProb = random(0.6, 0.7);
  const deerProb = random(0.04, 0.1);
  const lionProb = random(0.01, 0.03);
  deerHunger = floor(random(2, 5));
  deerReproduce = floor(random(2, 4));
  lionHunger = floor(random(8, 11));
  lionReproduce = floor(random(2, 4));

  // 초기화: 흙(0), 풀(1), 사슴(2), 사자(3)
  for (let y = 0; y < rows; y++) {
    grid[y] = [];
    for (let x = 0; x < cols; x++) {
      grid[y][x] = new Cell(x, y, random() < grassProb); // 흙 생성 확률
      if (random() < deerProb) deers.push(new Deer(x, y));
      else if (random() < lionProb) lions.push(new Lion(x, y));
    }
  }
}

function draw() {
  background(220);

  if (step === 1) {
    // 1. 풀 성장 (CA 규칙)
    for (let row of grid) {
      for (let cell of row) {
        cell.update();
      }
    }
  } else if (step === 2) {
    // 2. 사슴 행동
    for (let deer of deers) {
      deer.update();
    }
  } else if (step === 3) {
    // 3. 사자 행동
    for (let lion of lions) {
      lion.update();
    }
  }

  // 단계별로 3초마다 다음 스텝으로 넘어감 (예시)
  step = (step % 3) + 1;

  // 그리기
  for (let row of grid) {
    for (let cell of row) {
      cell.show();
    }
  }
  for (let deer of deers) {
    deers = deers.filter(d => !d.isDie);
    deer.show();
  }
  for (let lion of lions) {
    lions = lions.filter(l => !l.isDie);
    lion.show();
  }
}

// ----------------- 기본 셀 -----------------
class Cell {
  constructor(x, y, hasGrass = false) {
    this.x = x;
    this.y = y;
    this.hasGrass = hasGrass;
    this.soilTime = 0;
  }

  update() {
    if (!this.hasGrass) {
      this.soilTime++;

      if (this.soilTime < 2) return;
      let neighbors = this.countGrassNeighbors();
      if (neighbors >= 4 || (neighbors === 3 && random() < 0.01)) {
        this.hasGrass = true;
        this.soilTime = 0;
      }
    }
  }

  countGrassNeighbors() {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        let nx = this.x + dx;
        let ny = this.y + dy;
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
          let neighbor = grid[ny][nx];
          if (neighbor instanceof Cell && neighbor.hasGrass) count++;
        }
      }
    }
    return count;
  }

  show() {
    stroke(200);
    if (this.hasGrass) fill(60, 180, 90);
    else fill(240, 200, 140);
    rect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);
  }
}

// ----------------- 사슴 -----------------
class Deer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hunger = deerHunger; // 굶을 수 있는 턴
    this.eatenCount = 0;
    this.isDie = false;
  }

  update() {
    if (this.eatenCount >= deerReproduce) {
      if (random() < 0.5) {
        this.reproduce();
        this.eatenCount = 0;
        return;
      }
    }
    let [nx, ny] = this.randomMove();
    let target = grid[ny][nx];

    if (target.hasGrass) {
      target.hasGrass = false;
      this.hunger = deerHunger;
      this.eatenCount++;
    } else {
      this.hunger--;
      if (this.hunger <= 0) {
        this.isDie = true;
        return;
      }
    }

    this.x = nx;
    this.y = ny;
  }

  randomMove() {
    let dirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    let [dx, dy] = random(dirs);
    let nx = constrain(this.x + dx, 0, cols - 1);
    let ny = constrain(this.y + dy, 0, rows - 1);
    if (alreadyOccupied(nx, ny)) {
      return [this.x, this.y]; // 이동하지 않음
    }
    return [nx, ny];
  }

  reproduce() {
    let dirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    let [dx, dy] = random(dirs);
    let nx = constrain(this.x + dx, 0, cols - 1);
    let ny = constrain(this.y + dy, 0, rows - 1);
    if (alreadyOccupied(nx, ny)) return;
    deers.push(new Deer(nx, ny));
  }

  show() {
    push();
    fill(120, 70, 30);
    noStroke();
    beginShape();
    // 역삼각형 꼭지가 아래로 오도록
    let startAngle = PI / 2;
    for (let i = 0; i < 3; i++) {
      let angle = startAngle + i * TWO_PI / 3;
      let px = (this.x + 0.5) * cellSize + cos(angle) * cellSize / 2;
      let py = (this.y + 0.5) * cellSize + sin(angle) * cellSize / 2;
      vertex(px, py);
    }
    endShape(CLOSE);

    // hunger 숫자 표시
    fill(140);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(this.hunger, (this.x + 0.5) * cellSize, (this.y + 0.5) * cellSize);
    pop();
  }
}

// ----------------- 사자 -----------------
class Lion {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hunger = lionHunger;
    this.eatenCount = 0;
    this.isDie = false;
  }

  update() {
    if (this.eatenCount >= lionReproduce) {
      if (random() < 0.5) {
        this.reproduce();
        this.eatenCount = 0;
        return;
      }
    }
    let [nx, ny] = this.randomMove();
    let target = deers.find(d => d.x === nx && d.y === ny);

    if (target) {
      this.hunger = lionHunger;
      this.eatenCount++;
      target.isDie = true; // 사슴 제거
    } else {
      this.hunger--;
      if (this.hunger <= 0) {
        this.isDie = true;
        return;
      }
    }

    this.x = nx;
    this.y = ny;
  }

  randomMove() {
    let dirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    const shuffled = shuffle(dirs);
    let nx = this.x;
    let ny = this.y;
    for (let [dx, dy] of shuffled) {
      nx = constrain(this.x + dx, 0, cols - 1);
      ny = constrain(this.y + dy, 0, rows - 1);
      if (alreadyDeerOccupied(nx, ny)) {
        return [nx, ny]; // 사슴이 있으면 그쪽으로 이동
      }
      if (alreadyLionOccupied(nx, ny)) {
        continue; // 사자가 있으면 다른 방향 시도
      }
    }
    return [nx, ny];
  }

  reproduce() {
    let dirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    let [dx, dy] = random(dirs);
    let nx = constrain(this.x + dx, 0, cols - 1);
    let ny = constrain(this.y + dy, 0, rows - 1);
    if (alreadyOccupied(nx, ny)) return;
    lions.push(new Lion(nx, ny));
  }

  show() {
    push();
    fill(255, 170, 6);
    noStroke();
    // 오각형
    beginShape();
    for (let i = 0; i < 5; i++) {
      let angle = PI / 2 + i * TWO_PI / 5;
      let px = (this.x + 0.5) * cellSize + cos(angle) * cellSize / 2;
      let py = (this.y + 0.5) * cellSize + sin(angle) * cellSize / 2;
      vertex(px, py);
    }
    endShape(CLOSE);

    // hunger 숫자 표시
    fill(120);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(this.hunger, (this.x + 0.5) * cellSize, (this.y + 0.5) * cellSize);
    pop();
  }
}

function alreadyOccupied(x, y) {
  return deers.some(d => d.x === x && d.y === y) || lions.some(l => l.x === x && l.y === y);
}

function alreadyLionOccupied(x, y) {
  return lions.some(l => l.x === x && l.y === y);
}

function alreadyDeerOccupied(x, y) {
  return deers.some(d => d.x === x && d.y === y);
}