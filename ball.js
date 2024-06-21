class Ball {
  constructor(sym, x, y, r = 25, fill = "#EEEEEE") {
    this.sym = sym;
    this.x = x;
    this.y = y;
    this.r = r;
    this.fill = fill;
    this.velocityY = 0.1;
    this.velocityX = 0;
    // commented out mass is a real life calculation not suitable for my non scaled program instead let's device the radius by 10
    // this.mass = (4 / 3) * Math.PI * Math.pow(r, 3);
    this.mass = r / 10;
    // this.restitution = 1;
    this.dampingY = 0.9;
    this.gravity = 0.05;
    this.friction = 0.005;
    this.isDragging = false;
    this.tiltSensitivity = -0.0005;
  }
  draw() {
    this.sym.ctx.beginPath();
    this.sym.ctx.arc(this.x, this.y, this.r, Math.PI * 2, false);
    //Instead let's change color based on Y velocity. First we normalize the y velocity with min, max & current values
    // this.sym.ctx.fillStyle = this.fill;
    // let VNormal = this.velocityY / 5;
    // VNormal = Math.max(0, Math.min(1, VNormal));
    // const R = Math.round(VNormal * 255);
    // const G = 0;
    // const B = Math.round((1 - VNormal) * 255);
    const velCum = Math.abs(this.velocityY) + Math.abs(this.velocityX);
    const R = Math.min(255, Math.round(velCum * 50));
    const G = 0;
    const B = 255;
    const hex = `#${R.toString(16).padStart(2, "0")}${G.toString(16).padStart(
      2,
      "0"
    )}${B.toString(16).padStart(2, "0")}`;
    this.sym.ctx.fillStyle = hex.toUpperCase();
    this.sym.ctx.fill();
    this.sym.ctx.closePath();
  }
  update(tilt) {
    // We only want to run the physics on balls we are not dragging around the screen
    if (!this.isDragging) {
      // Handle Y physics and collisions
      this.velocityY += this.gravity;
      if (this.y + this.r >= this.sym.height) {
        this.y = this.sym.height - this.r;
        // reverse the direction of ball when hitting the ground for bounce effect apply damping effect to decrease balls kinetic energy
        this.velocityY *= -this.dampingY;
        this.dampingY -= Math.abs((0.1 * this.r) / 100);
        // if the velocity of the ball has decreased to almost 0 we set the velocity to 0 to settle and stop ball movement
        if (Math.abs(this.velocityY) < 0.1) {
          this.velocityY = 0;
          this.dampingY = 0.9;
        }
      }
      // Handle X physics & collisions
      if (Math.abs(this.velocityX) <= 0.1) {
        this.velocityX = 0;
      }
      if (this.x + this.r >= this.sym.width) {
        this.velocityX *= -1;
        this.x = this.sym.width - this.r;
      }
      if (this.x - this.r <= 0) {
        this.velocityX *= -1;
        this.x = 0 + this.r;
      }
      if (this.velocityX > 0) {
        this.velocityX -= this.friction;
      } else if (this.velocityX < 0) {
        this.velocityX += this.friction;
      }
      // Stop tilt for now
      if (tilt) {
        // this.velocityX += -(Math.floor(tilt) - 90) * this.tiltSensitivity;
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
