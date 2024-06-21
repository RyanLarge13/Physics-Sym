import Sym from "./sym.js";

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
    sym.initializeGrid();
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
  for (let i = 0; i < 3000; i++) {
    const randX = Math.max(
      5,
      Math.min(sym.width - 5, Math.random() * (sym.width - 10) + 5)
    );
    const randY = Math.max(
      5,
      Math.min(sym.height - 5, Math.random() * (sym.height - 10) + 5)
    );
    const randSize = Math.floor(Math.random() * 40);
    const randColor = Math.floor(Math.random() * 10);
    sym.createBall(randX, randY, 5, `#f${randColor}f`);
  }
  sym.initializeGrid();
  // sym.initializeWorkers();
  animate();
});
