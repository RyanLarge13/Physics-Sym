self.onmessage = (event) => {
  detectCollisions(event.data.ballI, event.data.balls);
};

const detectCollisions = (ballI, balls) => {
  for (let i = 0; i < balls.length; i++) {
    const ballA = ballI;
    const ballB = ballsToCheck[j];
    if (ballA === ballB) {
      continue;
    }
    const xDiff = ballB.x - ballA.x;
    const yDiff = ballB.y - ballA.y;
    const distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    // allowed to comment out this calculation given static ball sizes across the board
    // const minDistance = ballA.r + ballB.r;
    const minDistance = 10;
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
      const overlap = minDistance - distance;
      const correctionFactor = 0.5;
      const correctionX = overlap * normalX * correctionFactor;
      const correctionY = overlap * normalY * correctionFactor;
    }
  }
};
