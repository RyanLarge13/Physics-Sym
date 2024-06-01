class Ball {
  constructor(sym, x, y, r = 25, fill = "#EEEEEE") {
    this.sym = sym;
    this.x = x;
    this.y = y;
    this.r = r;
    this.fill = fill;
    this.velocityY = 0;
    this.dampingY = 0.9;
    this.velocityX = 0;
    this.dampingX = 0.9;
    this.gravity = 0.5;
    this.friction = 0.01;
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
        this.velocityY *= -this.dampingY;
        this.dampingY -= Math.abs((0.1 * this.r) / 100);
        if (Math.abs(this.velocityY) < 0.1) {
          this.velocityY = 0;
          this.dampingY = 0.9;
        }
      } else {
        this.velocityY += this.gravity;
      }
      if (this.x + this.r >= this.sym.width || this.x - this.r <= 0) {
        if (this.x + this.r > this.sym.width) {
          this.x = this.sym.width - this.r;
        }
        if (this.x - this.r <= 0) {
          this.x = 0 + this.r;
        }
        this.velocityX *= -this.dampingX;
        this.dampingX -= Math.abs((0.1 * this.r) / 100);
        if (Math.abs(this.velocityX) < 0.1) {
          this.velocityX = 0;
          this.dampingX = 0.9;
        }
      } else {
        this.velocityX > 0
          ? (this.velocityX -= this.friction)
          : (this.velocityX += this.friction);
      }
      this.y += this.velocityY;
      this.x += this.velocityX;
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

export default Ball;
