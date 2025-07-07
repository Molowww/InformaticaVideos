// Cambiar el tema cuando se activa el toggle BB8
const themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
  } else {
    document.body.classList.add("light-mode");
    document.body.classList.remove("dark-mode");
  }
});

// Opcional: establecer tema inicial por defecto
window.addEventListener("DOMContentLoaded", () => {
  // Por defecto: modo oscuro activado
  document.body.classList.add("dark-mode");
  themeToggle.checked = true;
});


function showVideo(n) {
  const contentArea = document.getElementById("content-area");

  const videoPaths = {
    1: "videos/video1.mp4",
    2: "videos/video2.mp4",
    3: "videos/video3.mp4",
    4: "videos/video4.mp4",
  };

  const videoSrc = videoPaths[n];

  if (videoSrc) {
    contentArea.innerHTML = `
      <video controls autoplay>
        <source src="${videoSrc}" type="video/mp4">
        Tu navegador no soporta el video.
      </video>
    `;
  } else {
    contentArea.innerHTML = `<p>Video no encontrado.</p>`;
  }
}

// Fondo de estrellas
const canvas = document.getElementById("galaxy-background");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let stars = [];
for (let i = 0; i < 150; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.5,
    dx: (Math.random() - 0.5) * 0.2,
    dy: (Math.random() - 0.5) * 0.2
  });
}

function animateStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";

  for (let star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();

    star.x += star.dx;
    star.y += star.dy;

    if (star.x < 0 || star.x > canvas.width) star.dx *= -1;
    if (star.y < 0 || star.y > canvas.height) star.dy *= -1;
  }

  requestAnimationFrame(animateStars);
}
animateStars();
