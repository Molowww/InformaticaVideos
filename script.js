// Nieve animada
const snowContainer = document.getElementById('snow');
function randomBetween(a, b) { return a + Math.random() * (b - a); }
function createSnowflake() {
  const snowflake = document.createElement('span');
  snowflake.className = 'snowflake';
  snowflake.innerHTML = Math.random() > 0.5 ? '❄️' : '✦';
  snowflake.style.left = randomBetween(0, 98) + 'vw';
  snowflake.style.fontSize = randomBetween(1, 2.2) + 'em';
  snowflake.style.animationDuration = randomBetween(4, 10) + 's';
  snowflake.style.opacity = randomBetween(0.5, 1);
  snowContainer.appendChild(snowflake);
  setTimeout(() => snowflake.remove(), 11000);
}
setInterval(createSnowflake, 250);

// Mostrar videos al hacer click en botones
function showVideo(num) {
  const content = document.getElementById('content-area');
  let videoSrc = '';
  switch(num) {
    case 1: videoSrc = 'Videos/BROTA NA BASE - HIMXN (1080p, h264).mp4'; break;
    case 2: videoSrc = 'videos/mi-video2.mp4'; break;
    case 3: videoSrc = 'videos/mi-video3.mp4'; break;
    case 4: videoSrc = 'videos/b.mp4'; break;
  }
  if (videoSrc) {
    content.innerHTML = `<video width="700" height="390" controls>
      <source src="${videoSrc}" type="video/mp4">
      Tu navegador no soporta el video.
      </video>`;
  } else {
    content.innerHTML = '<p>No hay video disponible.</p>';
  }
}

// Animar aparición de grupos al hacer scroll
const grupos = document.querySelectorAll('.grupo');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
grupos.forEach(grupo => observer.observe(grupo));

// --- CUBO 3D con THREE.js ---
let scene, camera, renderer, cube, particleSystem, animId, group;
let isUserInteracting = false;
let lastX = 0, velocityX = 0;
const autoRotateSpeed = 0.005, FRICTION = 0.96, particleCount = 300;
let particlePositions = [], particleVelocities = [];
const carasData = [
  {
    nombre: "Desarrollador Web",
    texto: "Desarrollador de páginas web principiante con conocimientos en HTML, CSS y JavaScript.",
    demoURL: "#",
    imgURL: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDA5OWZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5XZWIgRGV2PC90ZXh0Pjwvc3ZnPg=="
  },
  {
    nombre: "Bot Discord",
    texto: "Desarrollador de bots para Discord con experiencia en JavaScript y APIs de Discord.",
    demoURL: "#",
    imgURL: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNzI4OWRhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5EaXNjb3JkPC90ZXh0Pjwvc3ZnPg=="
  },
  {
    nombre: "Proyecto 3D",
    texto: "Cube 3D inspirado en Nightmare_33n usando Three.js para animaciones web.",
    demoURL: "#",
    imgURL: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY2YjNhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj4zRCBDdWJlPC90ZXh0Pjwvc3ZnPg=="
  },
  {
    nombre: "Proyecto 4",
    texto: "Proyecto adicional para mostrar más habilidades y experiencia en desarrollo.",
    demoURL: "#",
    imgURL: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGNhZjUwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm95ZWN0bzwvdGV4dD48L3N2Zz4="
  },
  {
    nombre: "Proyecto 5",
    texto: "Otro proyecto destacado con tecnologías modernas y mejores prácticas.",
    demoURL: "#",
    imgURL: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY5NzAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Nb2Rlcm5vPC90ZXh0Pjwvc3ZnPg=="
  },
  {
    nombre: "Proyecto 6",
    texto: "Proyecto final que demuestra la versatilidad y creatividad en el desarrollo.",
    demoURL: "#",
    imgURL: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOWM2N2JjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5GaW5hbDwvdGV4dD48L3N2Zz4="
  }
];

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

// Función para crear la textura de cada cara (card con imagen, texto y botón)
async function crearTexturaCaraAsync(data) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Fondo blanco
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Caja con esquinas redondeadas
    drawRoundedRect(ctx, 30, 30, 450, 450, 20);
    ctx.fillStyle = '#f9f9f9';
    ctx.fill();
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.stroke();

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = data.imgURL;

    img.onload = () => {
      ctx.drawImage(img, 40, 40, 432, 200);

      ctx.fillStyle = '#222';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(data.nombre, 40, 270);

      ctx.fillStyle = '#555';
      ctx.font = '18px sans-serif';
      wrapText(ctx, data.texto, 40, 310, 430, 24);

      ctx.fillStyle = '#007acc';
      ctx.fillRect(40, 430, 160, 36);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Read more →', 50, 455);

      const texture = new THREE.CanvasTexture(canvas);
      resolve(texture);
    };

    img.onerror = () => {
      ctx.fillStyle = '#f00';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('Error al cargar imagen', 40, 260);
      const texture = new THREE.CanvasTexture(canvas);
      resolve(texture);
    };
  });
}

// Función para esquinas redondeadas en canvas
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Función para ajustar texto multilinea en canvas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

async function initCube3D() {
  const canvas = document.getElementById('cube-canvas');
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, 800 / 600, 0.1, 1000);
  camera.position.z = 8;
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(800, 600);
  renderer.setClearColor(0x000000, 0);
  group = new THREE.Group();
  scene.add(group);

  // Luz
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(2, 2, 5);
  scene.add(directionalLight);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  // Partículas
  const particleSpread = 8;
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * particleSpread;
    const y = (Math.random() - 0.5) * particleSpread;
    const z = (Math.random() - 0.5) * particleSpread;
    positions.push(x, y, z);
    particlePositions.push(new THREE.Vector3(x, y, z));
    particleVelocities.push(new THREE.Vector3(
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01
    ));
  }
  particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  particleSystem = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({
    color: 0x800080,
    size: 0.06,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false
  }));
  group.add(particleSystem);

  // Crear materiales texturizados para el cubo
  const materiales = await Promise.all([0, 1, 2, 3, 4, 5].map(i => crearTexturaCaraAsync(carasData[i])));

  // Crear cubo
  const geometry = new THREE.BoxGeometry(4, 4, 4);
  const cubeMaterials = materiales.map(tex => new THREE.MeshBasicMaterial({ map: tex }));
  cube = new THREE.Mesh(geometry, cubeMaterials);
  group.add(cube);

  // Eventos mouse para rotación y click
  canvas.addEventListener('mousedown', (e) => {
    isUserInteracting = true;
    lastX = e.clientX;
  });
  window.addEventListener('mouseup', () => {
    isUserInteracting = false;
  });
  window.addEventListener('mousemove', (e) => {
    if (isUserInteracting) {
      const deltaX = e.clientX - lastX;
      velocityX = deltaX * 0.005;
      lastX = e.clientX;
    }
    // Actualizar posición del mouse para raycaster
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = - ((e.clientY - rect.top) / rect.height) * 2 + 1;
  });

  // Click para abrir link demoURL de la cara clickeada
  canvas.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(cube);
    if (intersects.length > 0) {
      const faceIndex = Math.floor(intersects[0].face.materialIndex);
      const data = carasData[faceIndex];
      if (data?.demoURL) {
        window.open(data.demoURL, '_blank');
      }
    }
  });

  animId = requestAnimationFrame(animate);
}

function animate() {
  animId = requestAnimationFrame(animate);

  // Actualizar partículas
  const positions = particleSystem.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    const pos = particlePositions[i];
    const vel = particleVelocities[i];
    pos.add(vel);
    if (pos.x > 4 || pos.x < -4) vel.x = -vel.x;
    if (pos.y > 4 || pos.y < -4) vel.y = -vel.y;
    if (pos.z > 4 || pos.z < -4) vel.z = -vel.z;

    positions[i * 3] = pos.x;
    positions[i * 3 + 1] = pos.y;
    positions[i * 3 + 2] = pos.z;
  }
  particleSystem.geometry.attributes.position.needsUpdate = true;

  // Rotación automática con fricción y arrastre mouse
  if (!isUserInteracting) {
    velocityX *= FRICTION;
  }
  group.rotation.y += autoRotateSpeed + velocityX;

  renderer.render(scene, camera);
}

window.onload = initCube3D;
