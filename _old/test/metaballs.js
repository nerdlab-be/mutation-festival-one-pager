// Original code by Gerard Ferrandez
// @see https://codepen.io/ge1doot/pen/RNdwQB?q=metaballs&limit=ge1doot

var lava0, lava1, lava2;

// ==== Point constructor ====
var Point = function (x, y) {
  this.x = x;
  this.y = y;
  this.magnitude = x * x + y * y;
  this.computed = 0;
  this.force = 0;
};

Point.prototype.add = function (p) {
  return new Point(this.x + p.x, this.y + p.y);
};
// ==== Ball constructor ====
var Ball = function (parent) {
  this.vel = new Point(
    (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.25),
    (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.2)
  );
  this.pos = new Point(
    parent.width * 0.2 + Math.random() * parent.width * 0.2,
    parent.height * 0.2 + Math.random() * parent.height * 0.2
  );
  let scale = 8;
  this.size = parent.wh / scale + Math.random() * (parent.wh / scale);
  this.width = parent.width;
  this.height = parent.height;
  this.pointer = parent.pointer;
};
// ==== interact ball ====
Ball.prototype.interactBall = function () {
  // ---- interact with pointer ----
  if (pointer.active) {
    var dx = pointer.x - this.pos.x;
    var dy = pointer.y - this.pos.y;
    var a = Math.atan2(dy, dx);
    var v = Math.min(10, 500 / Math.sqrt(dx * dx + dy * dy));
    this.pos = this.pos.add(new Point(Math.cos(a) * v, Math.sin(a) * v));
    // this.pos = this.pos.add(new Point(pointer.x, pointer.y));
    // this.pos = this.pos.add(
    //       new Point(
    //         pointer.x, pointer.y
    //       )
    //     );
  }
};
// ==== move balls ====
Ball.prototype.move = function () {
  // ---- bounce borders ----
  if (this.pos.x >= this.width - this.size) {
    if (this.vel.x > 0) this.vel.x = -this.vel.x;
    this.pos.x = this.width - this.size;
  } else if (this.pos.x <= this.size) {
    if (this.vel.x < 0) this.vel.x = -this.vel.x;
    this.pos.x = this.size;
  }
  if (this.pos.y >= this.height - this.size) {
    if (this.vel.y > 0) this.vel.y = -this.vel.y;
    this.pos.y = this.height - this.size;
  } else if (this.pos.y <= this.size) {
    if (this.vel.y < 0) this.vel.y = -this.vel.y;
    this.pos.y = this.size;
  }
  // ---- velocity ----
  this.pos = this.pos.add(this.vel);
};
// ==== lavalamp constructor ====
var LavaLamp = function (width, height, numBalls, c0, c1) {
  this.step = 1;
  this.width = width;
  this.height = height;
  this.wh = Math.min(width, height);
  this.sx = Math.floor(this.width / this.step);
  this.sy = Math.floor(this.height / this.step);
  this.paint = false;
  this.metaFill = createRadialGradient(this.sx, this.sy, this.wh, c0, c1);
  this.plx = [0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  this.ply = [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1];
  this.mscases = [0, 3, 0, 3, 1, 3, 0, 3, 2, 2, 0, 2, 1, 1, 0];
  this.ix = [1, 0, -1, 0, 0, 1, 0, -1, -1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1];
  this.grid = [];
  this.balls = [];
  this.iter = 0;
  this.sign = 1;
  this.pointer = pointer = {
    x: 0,
    y: 0,
    active: false,
  };
  this.canvas = document.getElementById("screen"); // Replace with your canvas ID
  window.addEventListener("mousemove", function (event) {
    // pointer.x = event.clientX - canvas.getBoundingClientRect().left;
    // pointer.y = event.clientY - canvas.getBoundingClientRect().top;
    pointer.x = event.clientX / 10;
    pointer.y = event.clientY / 10;
    pointer.active = true;
  });
  window.addEventListener("mouseout", function (event) {
    pointer.active = false;
  });
  // window.addEventListener('touchmove', function(event) {
  //   pointer.x = event.touches[0].clientX;
  //   pointer.y = event.touches[0].clientY;
  //   pointer.active = true;
  // });
  // window.addEventListener('touchend', function(event) {
  //   pointer.active = false;
  // }
  // );

  // ---- init grid ----
  for (var i = 0; i < (this.sx + 2) * (this.sy + 2); i++) {
    this.grid[i] = new Point(
      (i % (this.sx + 2)) * this.step,
      Math.floor(i / (this.sx + 2)) * this.step
    );
  }
  // ---- create metaballs ----
  for (var i = 0; i < numBalls; i++) {
    this.balls[i] = new Ball(this);
  }
};
// ==== compute cell force ====
LavaLamp.prototype.computeForce = function (x, y, idx) {
  var force;
  var id = idx || x + y * (this.sx + 2);
  if (x === 0 || y === 0 || x === this.sx || y === this.sy) {
    var force = 0.6 * this.sign;
  } else {
    var cell = this.grid[id];
    var force = 0;
    var i = 0,
      ball;
    while ((ball = this.balls[i++])) {
      force +=
        (ball.size * ball.size) /
        (-2 * cell.x * ball.pos.x -
          2 * cell.y * ball.pos.y +
          ball.pos.magnitude +
          cell.magnitude);
    }
    force *= this.sign;
  }
  this.grid[id].force = force;
  return force;
};
// ---- compute cell ----
LavaLamp.prototype.marchingSquares = function (next) {
  var x = next[0];
  var y = next[1];
  var pdir = next[2];
  var id = x + y * (this.sx + 2);
  if (this.grid[id].computed === this.iter) return false;
  var dir,
    mscase = 0;
  // ---- neighbors force ----
  for (var i = 0; i < 4; i++) {
    var idn = x + this.ix[i + 12] + (y + this.ix[i + 16]) * (this.sx + 2);
    var force = this.grid[idn].force;
    if (
      (force > 0 && this.sign < 0) ||
      (force < 0 && this.sign > 0) ||
      !force
    ) {
      // ---- compute force if not in buffer ----
      force = this.computeForce(x + this.ix[i + 12], y + this.ix[i + 16], idn);
    }
    if (Math.abs(force) > 1) mscase += Math.pow(2, i);
  }
  if (mscase === 15) {
    // --- inside ---
    return [x, y - 1, false];
  } else {
    // ---- ambiguous cases ----
    if (mscase === 5) dir = pdir === 2 ? 3 : 1;
    else if (mscase === 10) dir = pdir === 3 ? 0 : 2;
    else {
      // ---- lookup ----
      dir = this.mscases[mscase];
      this.grid[id].computed = this.iter;
    }
    // ---- draw line ----
    var ix =
      this.step /
      (Math.abs(
        Math.abs(
          this.grid[
            x +
              this.plx[4 * dir + 2] +
              (y + this.ply[4 * dir + 2]) * (this.sx + 2)
          ].force
        ) - 1
      ) /
        Math.abs(
          Math.abs(
            this.grid[
              x +
                this.plx[4 * dir + 3] +
                (y + this.ply[4 * dir + 3]) * (this.sx + 2)
            ].force
          ) - 1
        ) +
        1);
    ctx.lineTo(
      this.grid[
        x + this.plx[4 * dir + 0] + (y + this.ply[4 * dir + 0]) * (this.sx + 2)
      ].x +
        this.ix[dir] * ix,
      this.grid[
        x + this.plx[4 * dir + 1] + (y + this.ply[4 * dir + 1]) * (this.sx + 2)
      ].y +
        this.ix[dir + 4] * ix
    );
    this.paint = true;
    // ---- next ----
    return [x + this.ix[dir + 4], y + this.ix[dir + 8], dir];
  }
};
LavaLamp.prototype.renderMetaballs = function () {
  var i = 0,
    ball;
  while ((ball = this.balls[i++])) ball.move();
  // let interactionBall = this.balls[0];
  // interactionBall.interactBall();
  // ---- reset grid ----
  this.iter++;
  this.sign = -this.sign;
  this.paint = false;
  ctx.fillStyle = this.metaFill;
  ctx.beginPath();
  // ---- compute metaballs ----
  i = 0;
  // ctx.shadowBlur = 50;
  // ctx.shadowColor = "black";
  while ((ball = this.balls[i++])) {
    // ---- first cell ----
    var next = [
      Math.round(ball.pos.x / this.step),
      Math.round(ball.pos.y / this.step),
      false,
    ];
    // ---- marching squares ----
    do {
      next = this.marchingSquares(next);
    } while (next);

    // ---- calculate midpoint ----
    var centerX = (ball.pos.x ) 
    var centerY = (ball.pos.y )

    // ---- create radial gradient ----
    var gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, ball.size * 2);
    gradient.addColorStop(0, "rgba(221, 72, 147, 1)");
    gradient.addColorStop(1, "rgba(221, 72, 147, 0)");
    ctx.fillStyle = gradient;

    // ---- fill and close path ----
    if (this.paint) {
      ctx.fill();
      ctx.closePath();
      ctx.beginPath();
      this.paint = false;
    }
  }
};
// ---- gradients ----
let createRadialGradient = function (w, h, r, c0, c1) {
  var gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, r);
  gradient.addColorStop(0, c0);
  gradient.addColorStop(1, c1);
  return gradient;
};

// ==== main loop ====
var run = function () {
  requestAnimationFrame(run);
  ctx.clearRect(0, 0, screen.width, screen.height);
  // ---- render metaballs ----
  for (let i = 0; i < lavaLamps.length; i++) {
    lavaLamps[i].renderMetaballs();
  }
  createNoise();
};



// ---- fill with noise based on alpha channel ----

function createNoise() {
  var imageData = ctx.getImageData(0, 0, screen.width, screen.height);

  let data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    let alpha = data[i + 3];
    let noise = Math.random() * alpha - 10; // adjust the noise range as needed
    data[i + 3] = noise;
  }
  ctx.putImageData(imageData, 0, 0);
}

// ---- canvas ----
var canvas = document.getElementById("screen");
var ctx = canvas.getContext("2d");
var screen = {
  width: canvas.width,
  height: canvas.height,
  pointer: {
    init: function () {
      // pointer initialization code here
    },
  },
  resize: function () {
    // resize code here
  },
};
pointer = screen.pointer.init();
screen.resize();
// ---- create LavaLamps ----

lava0 = new LavaLamp(screen.width, screen.height, 3, "#e0559d", "#ff8a00");
// lava1 = new LavaLamp(screen.width, screen.height, 10, "#24519f", "#fa0000");
// lava2 = new LavaLamp(screen.width, screen.height, 10, "#60bfbd", "#1c4995");
const lavaLamps = [lava0];

// ---- start engine ----
run();
