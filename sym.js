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
  this.prevPosY = performance.now();
  this.prevPosX = performance.now();
  this.balls = [new Ball(this, this.width / 2, this.height / 2, 25, "#EEEEEE")];
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
    // We calculate the distance between balls delta Y and X values and compare it to the combined radii
    if (distance < minDistance) {
     const normalX = xDiff / distance;
     const normalY = yDiff / distance;
     const relativeVelocityX = ballA.velocityX - ballB.velocityX;
     const relativeVelocityY = ballA.velocityY - ballB.velocityY;
     // Calculate the velocity along the normalized vecotre between each ball to calculate velocity offsets
     const velocityAlongNormal =
      relativeVelocityX * normalX + relativeVelocityY * normalY;
     // commenting out average restitution, given my assumption is that all balls are made of the same material and their elesticity should be all
     // near the same as another allowing the balls mass to do the work instead.   //  creating a realistic relative velocity and force.
     //  This will potentially change in the future
     //const restitution = (ballA.restitution + ballB.restitution) / 2;
     const restitution = 1;
     const impulse = (-(1 + restitution) * velocityAlongNormal) / (1 /
     ballA.mass + 1 / ballB.mass)
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
   }
   // if (!this.balls[i].isDragging) {
   this.balls[i].update(this.tilt);
   // }
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
