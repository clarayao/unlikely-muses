class Flowpoint {
  constructor() {
    this.position = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(0, 0);
    this.r = 4;
    this.maxspeed = 0;
    this.maxforce = 0;
    this.lifespan = 1.0;
    this.lifeDecrease = 0.05;
    this.isDone = false;
    this.startEliminate = false;
    this.eliminate = false;
    this.colorR = 255;
  }

  initFromPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
  }

  initRandomSpeedAndForce() {
    this.maxspeed = random(1, 3);
    this.maxforce = random(0.5, 0.7);
  }

  run() {
    this.update();
    this.borders();
    this.show();
  }

  follow(flow) {
    let desired = flow.lookup(this.position);
    desired.mult(this.maxspeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce);
    this.applyForce(steer);
  }

  isOutOfBounds() {
    const bounds = {
      minXL: txtOutL.x,
      maxXL: txtIn.x,
      minXR: txtIn.x + txtIn.w,
      maxXR: txtOutR.x + txtOutR.w,
      // minY: height / 2 - (txtIn.h + txtOutL.h) / 2,
      // maxY: height / 2 + (txtIn.h + txtOutL.h) / 2,
      minY: txtIn.y,
      maxY: txtIn.y + txtIn.h,
    };
    return [
      this.position.x < bounds.minXL ||
        (this.position.x > bounds.maxXL && this.position.x < bounds.minXR) ||
        this.position.x > bounds.maxXR ||
        this.position.y < bounds.minY ||
        this.position.y > bounds.maxY,
      this.position.x > bounds.maxXL &&
        this.position.x < bounds.minXR &&
        this.position.y > bounds.minY &&
        this.position.y < bounds.maxY,
    ];
  }

  limit() {
    if (this.eliminate) {
      this.lifeDecrease = 0.5;
    } else {
      this.lifeDecrease = 0.01;
    }
    if (this.startEliminate) {
      this.lifespan -= this.lifeDecrease;
      if (this.lifespan < 0) {
        this.lifespan = 0;
        this.isDone = true;
      }
    }
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);

    if (this.isOutOfBounds()[0]) {
      this.startEliminate = true;
    }
    if (this.isOutOfBounds()[1]) {
      this.eliminate = true;
    }
    this.limit();
  }

  show() {
    push();
    stroke(this.colorR, this.lifespan * 100);
    strokeWeight(2);
    point(this.position.x, this.position.y);
    pop();
  }

  borders() {
    if (
      this.position.x < 0 ||
      this.position.x > width ||
      this.position.y < 0 ||
      this.position.y > height
    ) {
      this.isDone = true;
    }
  }

  release() {
    this.isDone = false;
    this.startEliminate = false;
    this.eliminate = false;
    this.lifespan = 1.0;
    this.colorR = 255;
    flowPointsPool.push(this);
  }

  static getFromPool() {
    if (flowPointsPool.length > 0) {
      return flowPointsPool.pop();
    } else {
      return new Flowpoint();
    }
  }
}
