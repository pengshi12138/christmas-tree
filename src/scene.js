import * as THREE from 'three';

let scene, camera, renderer;

export function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 50;

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('three-canvas'),
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // 添加基本灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(0, 50, 50);
  scene.add(pointLight);

  // 监听窗口变化
  window.addEventListener('resize', onWindowResize, false);
}

const particles = [];
const particleGroup = new THREE.Group();
scene.add(particleGroup);

const EMOJIS = ['🎁', '🎅', '🔔', '👔', '🌳', '🧦'];
const GEOMETRIES = [
  new THREE.SphereGeometry(0.8, 16, 16),
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.ConeGeometry(0.7, 1.5, 8)
];

function createEmojiTexture(emoji) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.font = '48px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createParticles(count = 300) {
  for (let i = 0; i < count; i++) {
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const geometry = GEOMETRIES[Math.floor(Math.random() * GEOMETRIES.length)];
    const material = new THREE.MeshStandardMaterial({
      map: createEmojiTexture(emoji),
      metalness: 0.4,
      roughness: 0.6
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = (Math.random() - 0.5) * 50;
    mesh.position.y = (Math.random() - 0.5) * 50;
    mesh.position.z = (Math.random() - 0.5) * 50;
    mesh.scale.setScalar(0.8 + Math.random() * 0.4);

    particles.push(mesh);
    particleGroup.add(mesh);
  }
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
