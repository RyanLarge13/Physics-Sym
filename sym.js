import Ball from "./ball.js";

class Sym {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.ctx = context;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.rect = this.canvas.getBoundingClientRect();
    this.selectedBall = null;
    this.tilt = 0;
    this.prevPosY = performance.now();
    this.prevPosX = performance.now();
    this.balls = [
      //   new Ball(this, this.width / 2, this.height / 2, 25, "#EEEEEE"),
    ];
    // We will define an object "this.grid" for initializing a new grid within Sym class to optimize our code. This is our first step into spacial partitioning for our simulation. This will significantly reduce the computational weight in our draw balls method
    this.grid = {
      size: {
        w: 0,
        h: 0,
      },
      map: new Map(),
    };
    this.canvas.addEventListener("touchstart", this.selectBall.bind(this));
    this.canvas.addEventListener("touchmove", this.moveBall.bind(this));
    this.canvas.addEventListener("touchend", this.deSelectBall.bind(this));
    this.canvas.addEventListener("mousedown", this.selectBall.bind(this));
    this.canvas.addEventListener("mousemove", this.moveBall.bind(this));
    this.canvas.addEventListener("mouseup", this.deSelectBall.bind(this));
  }
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  initializeGrid() {
    // Call this method after creating a new Sym class and defining creating your balls to properly initialize the grid
    // const sizes = [];
    // for (let i = 0; i < this.balls.length; i++) {
    //   const size = this.balls[i].r * 2;
    //   sizes.push(size);
    // }
    // const sum = sizes.reduce((a, b) => a + b, 0);
    // creating a new avg that is static to see if performance increases without'
    // calculating new sizes and averaging then each call
    // this worked a little
    const avg = 20;
    // const avg = Math.round(sum / this.balls.length);
    this.grid.size.w = Math.round(this.width / avg);
    this.grid.size.h = Math.round(this.height / avg);
    this.grid.map = new Map();
    for (let i = 0; i < this.balls.length; i++) {
      const gridX = Math.round(this.balls[i].x / this.grid.size.w);
      const gridY = Math.round(this.balls[i].y / this.grid.size.h);
      const key = `${gridX},${gridY}`;
      if (!this.grid.map.has(key)) {
        this.grid.map.set(key, []);
      }
      this.grid.map.get(key).push(this.balls[i]);
    }
  }
  getBallsToCheck(gridPos) {
    const [gridX, gridY] = gridPos.split(",").map(Number);
    let ballsToCheck = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${gridX + dx},${gridY + dy}`;
        if (this.grid.map.has(key)) {
          ballsToCheck = ballsToCheck.concat(this.grid.map.get(key));
        }
      }
    }
    return ballsToCheck;
  }
  drawBalls() {
    for (let i = 0; i < this.balls.length; i++) {
      this.balls[i].draw();
      const gridX = Math.round(this.balls[i].x / this.grid.size.w);
      const gridY = Math.round(this.balls[i].y / this.grid.size.h);
      // Calculate ball collisions within grid coordinate vicinity
      const ballsToCheck = this.getBallsToCheck(`${gridX},${gridY}`);
      // for (let j = i + 1; j < this.balls.length; j++) {
      // new for loop only checking balls in vicinity
      for (let j = 0; j < ballsToCheck.length; j++) {
        const ballA = this.balls[i];
        // const ballB = this.balls[j];
        const ballB = ballsToCheck[j];
        // since we use now a grid based collision detection we will check if ballA and ballB are in fact the same ball;
        if (ballA === ballB) {
          continue;
        }
        // commenting out to for performance?
        // const posA = ballA.getPos();
        // const posB = ballB.getPos();
        const xDiff = ballB.x - ballA.x;
        const yDiff = ballB.y - ballA.y;
        const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        const minDistance = ballA.r + ballB.r;
        // We calculate the distance between balls delta Y and X values and compare it to the combined radii
        if (distance < minDistance) {
          const normalX = xDiff / distance;
          const normalY = yDiff / distance;
          const relativeVelocityX = ballA.velocityX - ballB.velocityX;
          const relativeVelocityY = ballA.velocityY - ballB.velocityY;
          // Calculate the velocity along the normalized vector between each ball to calculate velocity offsets
          const velocityAlongNormal =
            relativeVelocityX * normalX + relativeVelocityY * normalY;
          // commenting out average restitution, given my assumption is that all balls are made of the same material and their elasticity should be all
          // near the same as another allowing the balls mass to do the work instead. Creating a realistic relative velocity and force.
          //  This will potentially change in the future
          //const restitution = (ballA.restitution + ballB.restitution) / 2;
          const restitution = 1;
          const impulse =
            (-(1 + restitution) * velocityAlongNormal) /
            (1 / ballA.mass + 1 / ballB.mass);
          // Update ball velocities along normal adjusting for mass and restitution
          ballA.velocityX += (impulse * normalX) / ballA.mass;
          ballA.velocityY += (impulse * normalY) / ballA.mass;
          ballB.velocityX -= (impulse * normalX) / ballB.mass;
          ballB.velocityY -= (impulse * normalY) / ballB.mass;
          const overlap = minDistance - distance;
          const correctionFactor = 0.5;
          const correctionX = overlap * normalX * correctionFactor;
          const correctionY = overlap * normalY * correctionFactor;
          ballA.x -= correctionX;
          ballA.y -= correctionY;
          ballB.x += correctionX;
          ballB.y += correctionY;
        }
        // }
        // if (!this.balls[i].isDragging) {
        // }
      }
      this.balls[i].update(this.tilt);
    }
    this.initializeGrid();
  }
  createBall(x, y, r = 25, fill = "#EEEEEE") {
    const newBall = new Ball(this, x, y, r, fill);
    this.balls.push(newBall);
  }
  selectBall(e) {
    e.preventDefault();
    e.stopPropagation();
    const clientX = e.touches
      ? e.touches[0].clientX - this.rect.left
      : e.clientX - this.rect.left;
    const clientY = e.touches
      ? e.touches[0].clientY - this.rect.top
      : e.clientY - this.rect.top;
    for (let i = 0; i < this.balls.length; i++) {
      const { x, y, r } = this.balls[i].getPos();
      const dis = Math.sqrt((clientX - x) ** 2 + (clientY - y) ** 2);
      if (dis <= r) {
        this.prevPosY = this.balls[i].y;
        this.prevPosX = this.balls[i].x;
        this.selectedBall = this.balls[i];
        this.selectedBall.isDragging = true;
        this.selectedBall.velocityY = 0;
        this.selectedBall.velocityX = 0;
        this.selectedBall.damping = 0.9;
        this.selectedBall.move(clientX, clientY);
        break;
      }
    }
  }
  moveBall(e) {
    e.preventDefault();
    e.stopPropagation();
    const clientX = e.touches
      ? e.touches[0].clientX - this.rect.left
      : e.clientX - this.rect.left;
    const clientY = e.touches
      ? e.touches[0].clientY - this.rect.top
      : e.clientY - this.rect.top;
    let deltaY = 0;
    let deltaX = 0;
    if (this.prevPosY !== null) {
      deltaY = clientY - this.prevPosY;
    }
    if (this.prevPosX !== null) {
      deltaX = clientX - this.prevPosX;
    }
    const currentTime = performance.now();
    const deltaTime = currentTime - this.prevTime;
    const velocityFactor = 0.2;
    if (this.selectedBall !== null && deltaTime > 0) {
      this.selectedBall.velocityY += (deltaY * velocityFactor) / deltaTime;
      this.selectedBall.velocityX += (deltaX * velocityFactor) / deltaTime;
      this.selectedBall.move(clientX, clientY);
    }
    this.prevPosY = clientY;
    this.prevPosX = clientX;
    this.prevTime = currentTime;
  }
  deSelectBall() {
    if (this.selectedBall !== null) {
      this.selectedBall.isDragging = false;
      this.selectedBall = null;
    }
  }
}

export default Sym;
