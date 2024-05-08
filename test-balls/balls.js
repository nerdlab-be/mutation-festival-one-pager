const spillFactorPixels = 100;

class Mouse {
  constructor() {
      this.posX = 0;
      this.posY = 0;
  }
}

const mouse = new Mouse();

class Circle {
  constructor(x, y, radius, dx, dy) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.dx = dx;
      this.dy = dy;
  }

  draw(ctx) {
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
      grad.addColorStop(0, `rgba(221, 72, 147, 1)`);
      grad.addColorStop(0.1, `rgba(221, 72, 147, 1)`);

      grad.addColorStop(1, `rgba(221, 72, 147, 0)`);

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.closePath();
  }

  update(canvas) {
      if (this.x + this.radius > canvas.width  + spillFactorPixels|| this.x - this.radius < -spillFactorPixels) {
          this.dx = -this.dx;
      }

      if (this.y + this.radius > canvas.height + spillFactorPixels || this.y - this.radius < -  spillFactorPixels) {
          this.dy = -this.dy;
      }

      this.x += this.dx;
      this.y += this.dy;
  }
}

window.onload = function() {
  const canvas = document.getElementById('screen');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const circles = [];

  // Interactive circle
  const interactiveCircle = new Circle(canvas.width / 2, canvas.height / 2, 150, 0, 0);
  interactiveCircle.velocity = { x: 0, y: 0 };
  circles.push(interactiveCircle);

  // Floating circles
  for (let i = 0; i < 5; i++) {
      const radius = Math.random() * 500 + 100;
      const x = Math.random() * (canvas.width - radius * 2) + radius;
      const y = Math.random() * (canvas.height - radius * 2) + radius;
      const dx = (Math.random() - 0.5) * 4;
      const dy = (Math.random() - 0.5) * 4;
      circles.push(new Circle(x, y, radius, dx, dy));
  }

  // canvas.addEventListener('mousemove', function(event) {
  //     interactiveCircle.x = event.clientX - rect.left;
  //     interactiveCircle.y = event.clientY - rect.top;
  // });

  window.addEventListener('mousemove', function(event) {
    const rect = canvas.getBoundingClientRect();

    mouse.posX = event.clientX - rect.left;
    mouse.posY = event.clientY - rect.top;

   

   
});

  function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const circle of circles) {
          circle.draw(ctx);
          circle.update(canvas);
          if (circle.velocity !== undefined) {
              updateInteractiveCirclePosition(circle);
          }
      }
      
      createNoise(ctx, canvas);

      requestAnimationFrame(animate);
  }

  animate();
};

function updateInteractiveCirclePosition(circle) {
  const dx = mouse.posX - circle.x;
  const dy = mouse.posY - circle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  const maxDistance = 500;
  const acceleration = 0.1;

  if (distance < maxDistance) {
    const maxDistance = 500;
    const acceleration = 0.1;

    if (distance < maxDistance) {
      const velocityFactor = 1 - distance / maxDistance;
      circle.velocity.x += Math.cos(angle) * acceleration * velocityFactor;
      circle.velocity.y += Math.sin(angle) * acceleration * velocityFactor;
    } else {
      circle.velocity.x = 0;
      circle.velocity.y = 0;
    }
      circle.velocity.x += Math.cos(angle) * acceleration;
      circle.velocity.y += Math.sin(angle) * acceleration;
  } else {
      circle.velocity.x = 0;
      circle.velocity.y = 0;
  }

  circle.x += circle.velocity.x;
  circle.y += circle.velocity.y;
  // let forceX = mouse.posX - circle.x;
  // let forceY = mouse.posY - circle.y;
  
  // circle.velocity.x += forceX * 0.001; // Adjust force factor as needed
  // circle.velocity.y += forceY * 0.001;
  // circle.x += circle.velocity.x;
  // circle.y += circle.velocity.y;
}

// ---- fill with noise based on alpha channel ----

function createNoise(ctx, canvas) {
  var imageData = ctx.getImageData(0, 0, screen.width, screen.height);

  let data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    if(Math.random() > 0.8) continue;
    let alpha = data[i + 3];
    let [r,g,b] = [data[i], data[i + 1], data[i + 2]];
    let noise = Math.random() * alpha; // adjust the noise range as needed
    // if (alpha < 10) {
    //   noise = Math.random() * alpha/10;;
    // }
    // if (alpha > 200) {
    //   noise = Math.random() * alpha* 10;
    // }
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = noise;
    // Get the pixel coordinates
  }
  ctx.putImageData(imageData, 0, 0);
}