let font,
  imgParticles = [];
let tSize = 96,
  seaWaveOffset = 0;
let textPoints = [],
  seaParticles = [],
  boatObject = null;
let words = ["Home", "My Works", "See Related", "Return"],
  currentWordIndex = 0;
let imgPaths = [
  "vector-objects-Step1_900x506.jpg",
  "yellow-happy-smile-face-emoticon-png-1.webp",
  "Vector-based_example.svg.png",
  "bird-colorful-logo-gradient-vector_343694-1365.png",
];

class LineObject {
  constructor(lines, col) {
    this.lines = lines.map(([x1, y1, x2, y2]) => ({
      start: createVector(x1, y1),
      end: createVector(x2, y2),
    }));
    this.col = col || color(0);
  }
  show() {
    stroke(this.col);
    strokeWeight(3);
    this.lines.forEach((l) => line(l.start.x, l.start.y, l.end.x, l.end.y));
  }
  isHovered() {
    return this.lines.some(
      (l) =>
        dist(
          mouseX,
          mouseY,
          (l.start.x + l.end.x) / 2,
          (l.start.y + l.end.y) / 2
        ) < 10
    );
  }
}

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  generateElements();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateElements();
}

function draw() {
  background((currentWordIndex * 90) % 360, 20, 100);
  seaWaveOffset += 0.05;
  if (
    !textPoints.length &&
    !seaParticles.length &&
    !boatObject &&
    !imgParticles.length
  )
    nextWord();
  textPoints.forEach((v, i) =>
    v.isHovered() ? textPoints.splice(i, 1) : v.update().show()
  );
  seaParticles.forEach((v, i) =>
    v.isHovered() ? seaParticles.splice(i, 1) : v.updateWave().show()
  );
  if (boatObject) {
    updateBoat();
    boatObject.show();
    if (boatObject.isHovered()) boatObject = null;
  }
  imgParticles.forEach((p, i) =>
    p.isHovered() ? imgParticles.splice(i, 1) : p.show()
  );

  if (isInImageBox(mouseX, mouseY)) {
    noCursor();
    fill(0);
    noStroke();
    ellipse(mouseX, mouseY, 50, 50);
  } else {
    cursor(ARROW);
  }
}

function generateElements() {
  generateText(words[currentWordIndex]);
  generateSea();
  generateBoat();
  generateImageParticles();
}

function nextWord() {
  currentWordIndex = (currentWordIndex + 1) % words.length;
  generateElements();
}

function generateText(word) {
  let xPos = word === "Home" || word === "Return" ? 50 : width - 550;
  textPoints = font
    .textToPoints(word, xPos, 150, tSize, { sampleFactor: 0.5 })
    .map((pt) => new Interact(pt.x, pt.y));
}

function generateSea() {
  seaParticles = Array.from(
    { length: width / 10 },
    (_, i) => new WaveParticle(i * 10, height / 2 + 150)
  );
}

function generateBoat() {
  let cx = width / 2,
    cy = height / 2 + 150;
  let boatLines = [
    [cx - 50, cy, cx + 50, cy],
    [cx + 50, cy, cx + 30, cy + 20],
    [cx + 30, cy + 20, cx - 30, cy + 20],
    [cx - 30, cy + 20, cx - 50, cy],
    [cx, cy, cx, cy - 50],
    [cx, cy - 50, cx + 40, cy],
    [cx + 40, cy, cx, cy],
  ];
  boatObject = new LineObject(boatLines, color(30));
}

function updateBoat() {
  if (boatObject) {
    let cx = width / 2,
      cy = height / 2 + 150 + sin(frameCount * 0.05) * 10;
    let boatLines = [
      [cx - 50, cy, cx + 50, cy],
      [cx + 50, cy, cx + 30, cy + 20],
      [cx + 30, cy + 20, cx - 30, cy + 20],
      [cx - 30, cy + 20, cx - 50, cy],
      [cx, cy, cx, cy - 50],
      [cx, cy - 50, cx + 40, cy],
      [cx + 40, cy, cx, cy],
    ];
    boatObject = new LineObject(boatLines, color(30));
  }
}

function generateImageParticles() {
  let img = loadImage(imgPaths[currentWordIndex], (img) => {
    imgParticles = [];
    let xOffset = (width * 2) / 3 - 175;
    let yOffset = height / 3 - 175;
    for (let i = 0; i < 40000; i++) {
      let x = random(xOffset, xOffset + 350);
      let y = random(yOffset, yOffset + 350);
      let c = img.get(
        int(map(x, xOffset, xOffset + 350, 0, img.width)),
        int(map(y, yOffset, yOffset + 350, 0, img.height))
      );
      imgParticles.push(new Particle(x, y, c));
    }
  });
}

class Particle {
  constructor(x, y, c) {
    this.pos = createVector(x, y);
    this.col = c;
  }
  show() {
    stroke(this.col);
    strokeWeight(4);
    point(this.pos.x, this.pos.y);
  }
  isHovered() {
    return dist(mouseX, mouseY, this.pos.x, this.pos.y) < 30; // Increased hover area
  }
}

function Interact(x, y) {
  this.pos = createVector(x, y);
  this.r = 20;
}
Interact.prototype.update = function () {
  return this;
};
Interact.prototype.show = function () {
  stroke(0);
  strokeWeight(4);
  point(this.pos.x, this.pos.y);
};
Interact.prototype.isHovered = function () {
  return dist(mouseX, mouseY, this.pos.x, this.pos.y) < this.r * 2;
};

function WaveParticle(x, y) {
  this.pos = createVector(x, y);
  this.baseY = y;
}
WaveParticle.prototype.updateWave = function () {
  this.pos.y = this.baseY + sin(this.pos.x * 0.05 + seaWaveOffset) * 10;
  return this;
};
WaveParticle.prototype.show = function () {
  stroke(200, 80, 80);
  strokeWeight(4);
  point(this.pos.x, this.pos.y);
};
WaveParticle.prototype.isHovered = function () {
  return dist(mouseX, mouseY, this.pos.x, this.pos.y) < 15;
};

function isInImageBox(x, y) {
  let xOffset = (width * 2) / 3 - 175;
  let yOffset = height / 3 - 175;
  return x > xOffset && x < xOffset + 350 && y > yOffset && y < yOffset + 350;
}
