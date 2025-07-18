// This file contains the p5.js code for the first example in Chapter 3.

function setup() {
    createCanvas(400, 400);
}

function draw() {
    background(220);
    fill(150, 0, 255);
    ellipse(mouseX, mouseY, 50, 50);
}