var world;

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  world = new World();

  // world.create(nodabee.create, 10);
  // world.create(rohmop.create, 10);
  // world.create(Plant_roh.create, 10);

  // world.create(Hanchi.create, 10);
  // world.create(Nalchi.create, 10);
  world.create(bloom.create, 10);

  // world.create(Worm_gh.create, 10);
  // world.create(Worm_gh_2.create, 10);
  // world.create(Fungi_gh.create, 10);

  // world.create(owoool.create, 10);
  // world.create(owoool2.create, 10);
  // world.create(Plant_ow.create, 10);

  world.create(SuperMob.create, 10);
  world.create(HyperMob.create, 10);
  world.create(PlantCustom.create, 10);

  // world.create(typo.create, 10);
  // world.create(typo2.create, 10);
  // world.create(plant_typo.create, 10);

  // world.create(jjinna.create, 10);
  // world.create(narong.create, 10);
  // world.create(Plant_ny.create, 10);

  world.create(ShyJelly.create, 10);
}

function draw() {
  //world.stop();
  background(0);
  setCenter();
  //drawingMode();
  //onSight();
  world.draw();
}