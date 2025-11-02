// Gui Setting
var Setting = function () {
  this.sightDist = 70;
  this.sightAngle = Math.PI * 0.5;
  this.mouseFollow = 3.0;
  this.separate = 0.0;
  this.cohesion = 0.0;
  this.align = 0.0;
};

var setting = new Setting();
// var gui = new dat.GUI();
// gui.add(setting, 'sightDist', 0, 300);
// gui.add(setting, 'sightAngle', 0, Math.PI);
// gui.add(setting, 'mouseFollow', 0, 10);
// gui.add(setting, 'separate', 0, 1);
// gui.add(setting, 'cohesion', 0, 1);
// gui.add(setting, 'align', 0, 0.1);
// gui.close();