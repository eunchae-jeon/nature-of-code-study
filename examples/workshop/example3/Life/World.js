class World {
  constructor() {
    this.boids = [];
    this.isStopped = false;
  }

  draw() {
    if (!this.isStopped) for (var i = 0; i < this.boids.length; i++) this.boids[i].update();
    if (isOnSight) for (var i = 0; i < this.boids.length; i++) this.boids[i].guide();
    for (var i = 0; i < this.boids.length; i++) {
      //       if(i==0){
      //         translate(width/2,height/2);
      //         rotate(-this.boids[i].vel.heading() - HALF_PI);
      //         translate(-this.boids[i].pos.x,-this.boids[i].pos.y);

      //       }
      this.boids[i].display();
    }

    this.boids = this.boids.filter(boid => boid.weight > 0);
    //this.boids = this.boids.filter(boid=>boid.hunger<1);
  }

  add(boid) {
    this.boids.push(boid);
  }

  create(create, number = 1) {
    for (var i = 0; i < number; i++) {
      let b = create();
      this.boids.push(b);
    }
  }

  stop() {
    this.isStopped = true;
  }
}

