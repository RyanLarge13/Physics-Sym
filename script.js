import Ball from "./ball.js";

let WIDTH;
let HEIGHT;

class Sym {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.ctx = context;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.rect = this.canvas.getBoundingClientRect();
    this.selectedBall = null;
    this.tilt = 0;
    this.prevPosY = null;
    this.prevPosX = null;
    this.balls = [
      new Ball(this, this.width / 2, this.height / 2, 25, "#EEEEEE"),
    ];
    this.canvas.addEventListener("touchstart", this.selectBall.bind(this));
    this.canvas.addEventListener("touchmove", this.moveBall.bind(this));
    this.canvas.addEventListener("touchend", this.deSelectBall.bind(this));
  }
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  drawBalls() {
    for (let i = 0; i < this.balls.length; i++) {
      this.balls[i].draw();
      for (let j = i + 1; j < this.balls.length; j++) {
        const ballA = this.balls[i];
        const ballB = this.balls[j];
        const posA = ballA.getPos();
        const posB = ballB.getPos();
        const xDiff = posB.x - posA.x;
        const yDiff = posB.y - posA.y;
        const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        const minDistance = posA.r + posB.r;
        if (distance < minDistance) {
          const normalX = xDiff / distance;
          const normalY = yDiff / distance;
          const relativeVelocityX = ballA.velocityX - ballB.velocityX;
          const relativeVelocityY = ballA.velocityY - ballB.velocityY;
          const velocityAlongNormal =
            relativeVelocityX * normalX + relativeVelocityY * normalY;
          const restitution = (ballA.restitution + ballB.restitution) / 2;
          const impulse =
            (-(1 + restitution) * velocityAlongNormal) /
            (1 / ballA.mass + 1 / ballB.mass);

          // Apply the impulse to the velocities considering their masses
          ballA.velocityX += (impulse / ballA.mass) * normalX;
          ballA.velocityY += (impulse / ballA.mass) * normalY;
          ballB.velocityX -= (impulse / ballB.mass) * normalX;
          ballB.velocityY -= (impulse / ballB.mass) * normalY;

          // Separate the balls to ensure they do not overlap
          const overlap = minDistance - distance;
          const correctionFactor = 10; // Fully correct the position

          const correctionX = overlap * normalX * correctionFactor;
          const correctionY = overlap * normalY * correctionFactor;

          ballA.x -=
            (correctionX / ballA.mass) *
            (ballA.mass / (ballA.mass + ballB.mass));
          ballA.y -=
            (correctionY / ballA.mass) *
            (ballA.mass / (ballA.mass + ballB.mass));
          ballB.x +=
            (correctionX / ballB.mass) *
            (ballB.mass / (ballA.mass + ballB.mass));
          ballB.y +=
            (correctionY / ballB.mass) *
            (ballB.mass / (ballA.mass + ballB.mass));
        }
      }
      if (!this.balls[i].isDragging) {
        this.balls[i].update(this.tilt);
      }
    }
  }
  createBall(x, y, r = 25, fill = "#EEEEEE") {
    const newBall = new Ball(this, x, y, r, fill);
    this.balls.push(newBall);
  }
  selectBall(e) {
    e.preventDefault();
    e.stopPropagation();
    const clientX = e.touches[0].clientX - this.rect.left;
    const clientY = e.touches[0].clientY - this.rect.top;
    for (let i = 0; i < this.balls.length; i++) {
      const { x, y, r } = this.balls[i].getPos();
      const dis = Math.sqrt((clientX - x) ** 2 + (clientY - y) ** 2);
      if (dis <= r) {
        this.selectedBall = this.balls[i];
        this.selectedBall.isDragging = true;
        this.selectedBall.velocity = 0;
        this.selectedBall.damping = 0.9;
        this.selectedBall.move(clientX, clientY);
        break;
      }
    }
  }
  moveBall(e) {
    e.preventDefault();
    e.stopPropagation();
    const clientX = e.touches[0].clientX - this.rect.left;
    const clientY = e.touches[0].clientY - this.rect.top;
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
    if (this.selectedBall !== null) {
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

const sizeCanvas = (canvas, w, h) => {
  canvas.width = w;
  canvas.height = h;
};

window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const winWidth = window.innerWidth;
  const winHeight = window.innerHeight;
  canvas.width = winWidth;
  canvas.height = winHeight;
  const sym = new Sym(canvas, ctx);
  window.addEventListener("resize", () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    sizeCanvas(canvas, w, h);
    sym.width = w;
    sym.height = h;
  });
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", (e) => {
      sym.tilt = e.alpha;
    });
  }
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation
      .lock("portrait")
      .then(() => console.log("locked"))
      .catch((err) => console.log(err, "not locked"));
  }
  let prevT = 0;
  const animate = (time) => {
    const deltaT = time - prevT;
    prevT = time;
    sym.clear();
    sym.drawBalls();
    requestAnimationFrame(animate);
  };
  for (let i = 0; i < 10; i++) {
    const randX = Math.floor(Math.random() * sym.width);
    const randY = Math.floor(Math.random() * 100);
    const randSize = Math.floor(Math.random() * 50);
    const randColor = Math.floor(Math.random() * 10);
    sym.createBall(randX, randY, randSize, `#f${randColor}f`);
  }
  animate();
});
