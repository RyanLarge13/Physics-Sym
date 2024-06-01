class Sym {
 constructor(canvas, context) {
  this.canvas = canvas;
  this.ctx = context;
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.rect = this.canvas.getBoundingClientRect();
  this.selectedBall = null;
  this.prevPos = null;
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
   if (!this.balls[i].isDragging) {
    this.balls[i].update();
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
  if (this.prevPos !== null) {
   deltaY = clientY - this.prevPos;
  }
  const currentTime = performance.now();
  const deltaTime = currentTime - this.prevTime;
  const velocityFactor = 0.1;
  if (this.selectedBall !== null) {
   const adjustedDeltaY = Math.sign(deltaY) * Math.abs(deltaY);
   this.selectedBall.velocity += (adjustedDeltaY * velocityFactor) / deltaTime;
   this.selectedBall.move(clientX, clientY);
  }
  this.prevPos = clientY;
  this.prevTime = currentTime;
 }
 deSelectBall() {
  if (this.selectedBall !== null) {
   this.selectedBall.isDragging = false;
   this.selectedBall = null;
  }
 }
}

class Ball {
 constructor(sym, x, y, r = 25, fill = "#EEEEEE") {
  this.sym = sym;
  this.x = x;
  this.y = y;
  this.r = r;
  this.fill = fill;
  this.velocity = 0;
  this.damping = 0.9;
  this.gravity = 0.5;
  this.isDragging = false;
 }
 draw() {
  this.sym.ctx.beginPath();
  this.sym.ctx.arc(this.x, this.y, this.r, Math.PI * 2, false);
  this.sym.ctx.fillStyle = this.fill;
  this.sym.ctx.fill();
  this.sym.ctx.closePath();
 }
 update() {
  if (!this.isDragging) {
   if (this.y + this.r >= this.sym.height) {
    this.y = this.sym.height - this.r;
    this.velocity *= -this.damping;
    this.damping -= 0.1;
    if (Math.abs(this.velocity) < 0.1) {
     this.velocity = 0;
     this.damping = 0.9;
    }
   } else {
    this.velocity += this.gravity;
   }
   this.y += this.velocity;
  }
 }
 move(x, y) {
  this.x = x;
  this.y = y;
 }
 getPos() {
  return { x: this.x, y: this.y, r: this.r };
 }
}

window.addEventListener("load", () => {
 const canvas = document.getElementById("canvas");
 const ctx = canvas.getContext("2d");
 canvas.width = 412;
 canvas.height = 815;
 const sym = new Sym(canvas, ctx);
 let prevT = 0;
 const animate = time => {
  const deltaT = time - prevT;
  prevT = time;
  sym.clear();
  sym.drawBalls();
  requestAnimationFrame(animate);
 };
 sym.createBall(50, 50, 50, "#f00");
 animate();
});
