/**
 * app.js — Escena principal de flores 3D
 * Usa Three.js (cargado en index.html) y los valores de CONFIG (config.js).
 */

/* ════════════════════════════════════════════════════════════════════════════
   1. ESCENA, CÁMARA, RENDERER
   ════════════════════════════════════════════════════════════════════════════ */
const scene    = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
renderer.toneMapping       = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Niebla y fondo
scene.background = new THREE.Color(CONFIG.backgroundColor);
scene.fog = new THREE.Fog(CONFIG.fogColor, CONFIG.fogNear, CONFIG.fogFar);

// Cámara orbital
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
let camAngle = 0;
camera.position.set(CONFIG.cameraDistance, CONFIG.cameraHeight, 0);
camera.lookAt(0, 1.5, 0);

/* ════════════════════════════════════════════════════════════════════════════
   2. ILUMINACIÓN
   ════════════════════════════════════════════════════════════════════════════ */
const ambientLight = new THREE.AmbientLight(0xffffff, CONFIG.ambientIntensity);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xfff5e0, CONFIG.directionalIntensity);
dirLight.position.set(8, 16, 6);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far  = 60;
dirLight.shadow.camera.left = dirLight.shadow.camera.bottom = -15;
dirLight.shadow.camera.right = dirLight.shadow.camera.top  =  15;
scene.add(dirLight);

const fill = new THREE.DirectionalLight(0xc0a0ff, 0.4);
fill.position.set(-6, 5, -8);
scene.add(fill);

const pointLight = new THREE.PointLight(new THREE.Color(CONFIG.pointLightColor), 1.2, 18);
pointLight.position.set(0, 4, 0);
scene.add(pointLight);

/* ════════════════════════════════════════════════════════════════════════════
   3. SUELO (pasto / ground)
   ════════════════════════════════════════════════════════════════════════════ */
(function buildGround() {
  const geo = new THREE.CircleGeometry(14, 64);
  const mat = new THREE.MeshLambertMaterial({ color: 0x1a3d10 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  // Segundo plano más oscuro
  const geo2 = new THREE.CircleGeometry(30, 32);
  const mat2 = new THREE.MeshLambertMaterial({ color: 0x0d0520 });
  const mesh2 = new THREE.Mesh(geo2, mat2);
  mesh2.rotation.x = -Math.PI / 2;
  mesh2.position.y = -0.01;
  scene.add(mesh2);
})();

/* ════════════════════════════════════════════════════════════════════════════
   4. GEOMETRÍAS DE FLORES
   ════════════════════════════════════════════════════════════════════════════ */

/** Crea un pétalo con forma de lágrima y curvatura 3D */
function makePetalGeometry(width, height, curvature = 0.28) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo( width * 0.55, height * 0.2,  width * 0.55, height * 0.78, 0, height);
  shape.bezierCurveTo(-width * 0.55, height * 0.78, -width * 0.55, height * 0.2,  0, 0);

  const geo = new THREE.ShapeGeometry(shape, 14);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i) / height;
    const z = curvature * Math.sin(t * Math.PI) + 0.05 * Math.sin(t * Math.PI * 3);
    pos.setZ(i, z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Crea un pétalo de gerbera (más ancho/plano) */
function makeGerberaPetalGeo(width, height) {
  const shape = new THREE.Shape();
  const tip = width * 0.15;
  shape.moveTo(-tip, 0);
  shape.bezierCurveTo(-width * 0.5, height * 0.3, -width * 0.4, height * 0.85, 0, height);
  shape.bezierCurveTo( width * 0.4, height * 0.85,  width * 0.5, height * 0.3,  tip, 0);
  shape.lineTo(-tip, 0);

  const geo = new THREE.ShapeGeometry(shape, 10);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i) / height;
    pos.setZ(i, 0.12 * Math.sin(t * Math.PI));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Crea un pétalo de rosa (más corto, redondeado, muy curvado) */
function makeRosePetalGeo(width, height, layer = 0) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo( width * 0.6, height * 0.15,  width * 0.65, height * 0.65, 0, height);
  shape.bezierCurveTo(-width * 0.65, height * 0.65, -width * 0.6, height * 0.15, 0, 0);

  const geo = new THREE.ShapeGeometry(shape, 14);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i) / height;
    const x = pos.getX(i);
    // Capas más internas = más curvadas hacia adentro
    const cup   = (0.35 + layer * 0.12) * Math.sin(t * Math.PI);
    const rollX = 0.15 * (x / (width * 0.65)) * (1 - t);
    pos.setZ(i, cup + rollX);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Geometría de hoja */
function makeLeafGeo(w, h) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo( w * 0.6, h * 0.2, w * 0.5, h * 0.75, 0, h);
  shape.bezierCurveTo(-w * 0.5, h * 0.75, -w * 0.6, h * 0.2, 0, 0);
  const geo = new THREE.ShapeGeometry(shape, 8);
  geo.computeVertexNormals();
  return geo;
}

/* ─── Materiales reutilizables ─────────────────────────────────────────────── */
function petalMat(color, color2) {
  return new THREE.MeshPhongMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color2 || color).multiplyScalar(0.06),
    shininess: 28,
    side: THREE.DoubleSide,
  });
}

function stemMat() {
  return new THREE.MeshPhongMaterial({ color: new THREE.Color(CONFIG.stemColor), shininess: 8 });
}

function leafMat() {
  return new THREE.MeshLambertMaterial({
    color: new THREE.Color(CONFIG.leafColor),
    side: THREE.DoubleSide,
    transparent: true, opacity: 0.9,
  });
}

/* ════════════════════════════════════════════════════════════════════════════
   5. CONSTRUCTORES DE FLORES
   ════════════════════════════════════════════════════════════════════════════ */

function buildGerbera(colorPetal, colorCenter) {
  const root = new THREE.Group();

  // ── Tallo ──
  const stemGeo = new THREE.CylinderGeometry(0.045, 0.065, 2.8, 8);
  const stem    = new THREE.Mesh(stemGeo, stemMat());
  stem.castShadow = true;
  stem.position.y = 1.4;
  root.add(stem);

  // ── Hoja ──
  const lGeo  = makeLeafGeo(0.5, 1.1);
  const lMat  = leafMat();
  const leaf1 = new THREE.Mesh(lGeo, lMat);
  leaf1.position.set(0, 1.0, 0);
  leaf1.rotation.set(0.3, Math.PI / 3, 0.9);
  leaf1.castShadow = true;
  root.add(leaf1);
  const leaf2 = leaf1.clone();
  leaf2.rotation.set(0.3, -Math.PI / 2.5, -0.9);
  root.add(leaf2);

  // ── Centro ──
  const centerGeo = new THREE.CylinderGeometry(0.55, 0.50, 0.18, 32);
  const centerMat = new THREE.MeshPhongMaterial({ color: new THREE.Color(colorCenter), shininess: 20 });
  const center    = new THREE.Mesh(centerGeo, centerMat);
  center.position.y = 2.83;
  center.castShadow = true;
  root.add(center);

  // Semillas (pequeñas esferas en espiral)
  const seedMat = new THREE.MeshPhongMaterial({ color: 0x553300, shininess: 40 });
  const seedGeo = new THREE.SphereGeometry(0.032, 5, 5);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < 80; i++) {
    const angle = i * goldenAngle;
    const r     = 0.48 * Math.sqrt(i / 80);
    const seed  = new THREE.Mesh(seedGeo, seedMat);
    seed.position.set(Math.cos(angle) * r, 2.92, Math.sin(angle) * r);
    root.add(seed);
  }

  // ── Pétalos capa exterior ──
  const outerGeo = makeGerberaPetalGeo(0.38, 1.35);
  const innerGeo = makeGerberaPetalGeo(0.28, 0.85);
  const pMat     = petalMat(colorPetal, CONFIG.petalColor2);

  const N_OUTER = 24, N_INNER = 18;
  for (let i = 0; i < N_OUTER; i++) {
    const p   = new THREE.Mesh(outerGeo, pMat);
    const ang = (i / N_OUTER) * Math.PI * 2;
    p.position.set(Math.cos(ang) * 0.52, 2.82, Math.sin(ang) * 0.52);
    p.rotation.order = 'YXZ';
    p.rotation.x = Math.PI / 2.1;
    p.rotation.y = Math.PI / 2 - ang;
    root.add(p);
  }
  for (let i = 0; i < N_INNER; i++) {
    const p   = new THREE.Mesh(innerGeo, petalMat(CONFIG.petalColor2, colorPetal));
    const ang = (i / N_INNER) * Math.PI * 2 + Math.PI / N_INNER;
    p.position.set(Math.cos(ang) * 0.28, 2.84, Math.sin(ang) * 0.28);
    p.rotation.order = 'YXZ';
    p.rotation.x = Math.PI / 2.8;
    p.rotation.y = Math.PI / 2 - ang;
    root.add(p);
  }

  return root;
}

/* ─────────────────────────────────────────────────────────────────────────── */

function buildSunflower(colorPetal, colorCenter) {
  const root = new THREE.Group();

  const stemGeo = new THREE.CylinderGeometry(0.055, 0.08, 3.8, 8);
  const stem    = new THREE.Mesh(stemGeo, stemMat());
  stem.position.y = 1.9;
  stem.castShadow = true;
  root.add(stem);

  // Hojas
  const lGeo = makeLeafGeo(0.65, 1.3);
  const lm   = leafMat();
  [1.2, 2.2].forEach((y, idx) => {
    const l = new THREE.Mesh(lGeo, lm);
    l.position.set(0, y, 0);
    l.rotation.set(0.2, idx % 2 === 0 ? Math.PI / 3 : -Math.PI / 2.5, idx % 2 === 0 ? 1 : -1);
    l.castShadow = true;
    root.add(l);
  });

  // Centro marrón
  const cGeo = new THREE.CylinderGeometry(0.75, 0.68, 0.22, 32);
  const cMat = new THREE.MeshPhongMaterial({ color: 0x4a2800, shininess: 25 });
  const cMesh = new THREE.Mesh(cGeo, cMat);
  cMesh.position.y = 3.85;
  root.add(cMesh);

  // Semillas Fibonacci
  const sMat = new THREE.MeshPhongMaterial({ color: 0x2a1200, shininess: 50 });
  const sGeo = new THREE.SphereGeometry(0.04, 5, 5);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < 130; i++) {
    const ang = i * goldenAngle;
    const r   = 0.68 * Math.sqrt(i / 130);
    const s   = new THREE.Mesh(sGeo, sMat);
    s.position.set(Math.cos(ang) * r, 3.97, Math.sin(ang) * r);
    root.add(s);
  }

  // Pétalos amarillos
  const pGeo = makePetalGeometry(0.44, 1.65, 0.18);
  const pMat = petalMat(colorPetal, '#ffb300');
  for (let i = 0; i < 22; i++) {
    const p   = new THREE.Mesh(pGeo, pMat);
    const ang = (i / 22) * Math.PI * 2;
    p.position.set(Math.cos(ang) * 0.7, 3.84, Math.sin(ang) * 0.7);
    p.rotation.order = 'YXZ';
    p.rotation.x  = Math.PI / 2.3;
    p.rotation.y  = Math.PI / 2 - ang;
    p.rotation.z  = 0.04 * (Math.random() - 0.5);
    root.add(p);
  }
  // Segunda capa (intercalada)
  const pGeo2 = makePetalGeometry(0.34, 1.2, 0.20);
  for (let i = 0; i < 16; i++) {
    const p   = new THREE.Mesh(pGeo2, pMat);
    const ang = (i / 16) * Math.PI * 2 + Math.PI / 16;
    p.position.set(Math.cos(ang) * 0.42, 3.86, Math.sin(ang) * 0.42);
    p.rotation.order = 'YXZ';
    p.rotation.x = Math.PI / 2.8;
    p.rotation.y = Math.PI / 2 - ang;
    root.add(p);
  }

  return root;
}

/* ─────────────────────────────────────────────────────────────────────────── */

function buildRose(colorPetal, colorInner) {
  const root = new THREE.Group();

  // Tallo
  const sGeo = new THREE.CylinderGeometry(0.04, 0.06, 2.5, 8);
  const sMesh = new THREE.Mesh(sGeo, stemMat());
  sMesh.position.y = 1.25;
  sMesh.castShadow = true;
  root.add(sMesh);

  // Hojas
  const lG = makeLeafGeo(0.55, 1.0);
  const lm = leafMat();
  const l1 = new THREE.Mesh(lG, lm);
  l1.position.set(0, 0.9, 0);
  l1.rotation.set(0.25, Math.PI / 4, 1.0);
  root.add(l1);
  const l2 = l1.clone();
  l2.rotation.set(0.25, -Math.PI / 3, -1.0);
  root.add(l2);

  // Sépalos (verdes bajo la flor)
  const sepMat = leafMat();
  const sepGeo = makePetalGeometry(0.22, 0.55, 0.08);
  for (let i = 0; i < 5; i++) {
    const sp  = new THREE.Mesh(sepGeo, sepMat);
    const ang = (i / 5) * Math.PI * 2;
    sp.position.set(Math.cos(ang) * 0.38, 2.45, Math.sin(ang) * 0.38);
    sp.rotation.order = 'YXZ';
    sp.rotation.x = Math.PI / 2.5;
    sp.rotation.y = Math.PI / 2 - ang;
    root.add(sp);
  }

  // Capas de pétalos (de exterior a interior)
  const layers = [
    { n: 8,  r: 0.82, rx: Math.PI / 2.05, h: 0.90, w: 0.60, y: 2.50, layer: 0 },
    { n: 7,  r: 0.64, rx: Math.PI / 2.3,  h: 0.78, w: 0.52, y: 2.58, layer: 1 },
    { n: 6,  r: 0.47, rx: Math.PI / 2.7,  h: 0.65, w: 0.44, y: 2.67, layer: 2 },
    { n: 5,  r: 0.30, rx: Math.PI / 3.2,  h: 0.52, w: 0.36, y: 2.74, layer: 3 },
    { n: 4,  r: 0.14, rx: Math.PI / 4.5,  h: 0.38, w: 0.28, y: 2.80, layer: 4 },
  ];

  layers.forEach(({ n, r, rx, h, w, y, layer }) => {
    const col  = layer < 2 ? colorPetal : colorInner;
    const mat  = petalMat(col, colorInner);
    const geo  = makeRosePetalGeo(w, h, layer);
    const base = (layer / layers.length) * Math.PI * 0.25; // offset angular
    for (let i = 0; i < n; i++) {
      const p   = new THREE.Mesh(geo, mat);
      const ang = (i / n) * Math.PI * 2 + base;
      p.position.set(Math.cos(ang) * r, y, Math.sin(ang) * r);
      p.rotation.order = 'YXZ';
      p.rotation.x = rx;
      p.rotation.y = Math.PI / 2 - ang;
      p.castShadow = true;
      root.add(p);
    }
  });

  return root;
}

/* ════════════════════════════════════════════════════════════════════════════
   6. POBLAR EL JARDÍN
   ════════════════════════════════════════════════════════════════════════════ */
const flowers     = [];   // { group, windOffset, windPhase, baseY, posR, posA }

function buildFlower() {
  const type = CONFIG.flowerType;
  if (type === 'sunflower') return buildSunflower(CONFIG.petalColor, CONFIG.centerColor);
  if (type === 'rose')      return buildRose(CONFIG.petalColor, CONFIG.petalColor2);
  return buildGerbera(CONFIG.petalColor, CONFIG.centerColor);
}

(function populateGarden() {
  const N = Math.max(1, Math.min(CONFIG.flowerCount, 20));
  const R = CONFIG.spreadRadius;

  // Flor central
  const center = buildFlower();
  scene.add(center);
  flowers.push({ group: center, windOffset: 0, windPhase: Math.random() * Math.PI * 2, baseY: 0, posR: 0, posA: 0 });

  // Flores en anillo(s)
  for (let i = 1; i < N; i++) {
    const ring   = Math.ceil(i / 6);
    const rHere  = ring * (R / Math.ceil(N / 6 + 1));
    const count  = Math.min(N - 1, 6);
    const posA   = (i / N) * Math.PI * 2 + (ring * 0.4);
    const jitter = (Math.random() - 0.5) * 0.8;
    const f      = buildFlower();
    const x      = Math.cos(posA) * (rHere + jitter);
    const z      = Math.sin(posA) * (rHere + jitter);
    f.position.set(x, 0, z);
    const s = 0.7 + Math.random() * 0.55;
    f.scale.setScalar(s);
    f.rotation.y = Math.random() * Math.PI * 2;
    scene.add(f);
    flowers.push({ group: f, windOffset: (Math.random() - 0.5) * 0.6, windPhase: Math.random() * Math.PI * 2, baseY: 0, posR: rHere, posA });
  }
})();

/* ════════════════════════════════════════════════════════════════════════════
   7. PARTÍCULAS / BRILLOS
   ════════════════════════════════════════════════════════════════════════════ */
let particleSystem;

if (CONFIG.showParticles) {
  const count    = CONFIG.particleCount;
  const geo      = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const phases    = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const r = 2 + Math.random() * 8;
    const a = Math.random() * Math.PI * 2;
    positions[i * 3]     = Math.cos(a) * r;
    positions[i * 3 + 1] = Math.random() * 6;
    positions[i * 3 + 2] = Math.sin(a) * r;
    phases[i] = Math.random() * Math.PI * 2;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('phase',    new THREE.BufferAttribute(phases, 1));

  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(CONFIG.particleColor),
    size: CONFIG.particleSize,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  particleSystem = new THREE.Points(geo, mat);
  scene.add(particleSystem);
}

/* ════════════════════════════════════════════════════════════════════════════
   8. LUZ PUNTUAL DE COLOR (sutil, animada)
   ════════════════════════════════════════════════════════════════════════════ */
const movingLight = new THREE.PointLight(new THREE.Color(CONFIG.petalColor), 0.7, 10);
movingLight.position.set(3, 3, 0);
scene.add(movingLight);

/* ════════════════════════════════════════════════════════════════════════════
   9. LOOP DE ANIMACIÓN
   ════════════════════════════════════════════════════════════════════════════ */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  const delta   = clock.getDelta ? 0.016 : 0.016; // fixed delta

  // Rotación de cámara
  camAngle += CONFIG.rotationSpeed * 0.003;
  camera.position.x = Math.cos(camAngle) * CONFIG.cameraDistance;
  camera.position.z = Math.sin(camAngle) * CONFIG.cameraDistance;
  camera.position.y = CONFIG.cameraHeight + Math.sin(elapsed * 0.18) * 0.3;
  camera.lookAt(0, 2.0, 0);

  // Viento en flores
  flowers.forEach(({ group, windPhase }) => {
    const sway = Math.sin(elapsed * CONFIG.windSpeed + windPhase) * CONFIG.windStrength * 0.06;
    group.rotation.z = sway;
    group.rotation.x = Math.cos(elapsed * CONFIG.windSpeed * 0.7 + windPhase) * CONFIG.windStrength * 0.03;
  });

  // Luz móvil
  movingLight.position.x = Math.cos(elapsed * 0.5) * 5;
  movingLight.position.z = Math.sin(elapsed * 0.5) * 5;

  // Partículas: flotación suave
  if (particleSystem) {
    const pos = particleSystem.geometry.attributes.position;
    const ph  = particleSystem.geometry.attributes.phase;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) + Math.sin(elapsed * 0.5 + ph.getX(i)) * 0.003;
      pos.setY(i, y < -0.2 ? 6.2 : y);
    }
    pos.needsUpdate = true;
    particleSystem.rotation.y = elapsed * 0.03;
    particleSystem.material.opacity = 0.5 + 0.3 * Math.sin(elapsed * 0.4);
  }

  renderer.render(scene, camera);
}

animate();

/* ════════════════════════════════════════════════════════════════════════════
   10. MODAL DE LA CARTA
   ════════════════════════════════════════════════════════════════════════════ */
const overlay  = document.getElementById('modal-overlay');
const openBtn  = document.getElementById('letter-btn');
const closeBtn = document.getElementById('close-btn');

openBtn.addEventListener('click', () => overlay.classList.add('active'));
closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) overlay.classList.remove('active');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') overlay.classList.remove('active');
});

/* ════════════════════════════════════════════════════════════════════════════
   11. RESIZE
   ════════════════════════════════════════════════════════════════════════════ */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ════════════════════════════════════════════════════════════════════════════
   12. OCULTAR LOADER
   ════════════════════════════════════════════════════════════════════════════ */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
    setTimeout(() => loader && (loader.style.display = 'none'), 900);
  }, 800);
});
