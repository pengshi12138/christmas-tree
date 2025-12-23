import { initScene, animate } from './scene.js';

initScene();
animate();

// 全屏控制按钮
const btn = document.getElementById('fullscreen-btn');
btn.addEventListener('click', () => {
  const canvas = document.getElementById('three-canvas');
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});
