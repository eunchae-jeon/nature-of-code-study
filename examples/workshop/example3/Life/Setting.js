let CenterPosition = new p5.Vector(0, 0);
let isOnSight = false;
let isDrawingMode = false;

function setCenter() {
  translate(width / 2, height / 2);
}

function drawGrid(mode) {
  let len1 = mode ? height : width;
  let len2 = mode ? width : height;
  stroke(30);
  strokeWeight(1);
  var gap = 20;
  for (var x = -gap; x > -len1 / 2; x -= gap) line(x, -len2 / 2, x, len2 / 2);
  for (var x = gap; x < len1 / 2; x += gap) line(x, -len2 / 2, x, len2 / 2);
  for (var y = -gap; y > -len2 / 2; y -= gap) line(-len1 / 2, y, len1 / 2, y);
  for (var y = gap; y < len2 / 2; y += gap) line(-len1 / 2, y, len1 / 2, y);


  stroke(70);
  line(-len1 / 2, 0, len1 / 2, 0);
  line(0, -len2 / 2, 0, len2 / 2);

  noFill();
  stroke(255);
}

function drawingMode() {
  drawGrid(false);
  isDrawingMode = true;
}

function onSight() {
  isOnSight = true;
}