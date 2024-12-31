console.log('three.js Version: ' + THREE.REVISION);

let container, gui, stats;
let scene, camera, renderer, labelRenderer;
let controls;
let time,
  frame = 0;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const WORLD_SIZE = 1000;
let popWindowOn = false;

// Add this function to check if clicking on UI
function isUIElement(element) {
  // Return true if clicking on any UI element
  return element.closest('#generate-btn') || 
         element.closest('#monitor-action-container') || 
         element.closest('#data-container') ||
         element.closest('#nav-btns-container') || 
         element.closest('.selection-result') ||
         element.closest('.bx-x') || 
         element.closest('.expand-button');
}

function initThree() {
  scene = new THREE.Scene();

  const axesHelper = new THREE.AxesHelper(WORLD_SIZE / 2);
  axesHelper.layers.enableAll();
  // axesHelper.scale(100, 100, 100);
  scene.add(axesHelper);

  const fov = 50;
  const aspectRatio = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 10000;

  container = document.getElementById('container-three');
  camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
  camera.position.z = 1500;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(container.clientWidth, container.clientHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.left = '0';
  // labelRenderer.domElement.style.width = '80vw';
  // labelRenderer.domElement.style.wordWrap = 'break-word';
  document.body.appendChild(labelRenderer.domElement);

  window.addEventListener('resize', function () {
    const width = container.clientWidth;
    const height = container.clientHeight;
  
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  
    renderer.setSize(width, height);
    labelRenderer.setSize(width, height);
  });

  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, document.body);
  // Add this before setting up OrbitControls
  document.body.addEventListener('pointerdown', (e) => {
    if (isUIElement(e.target) || popWindowOn) {
        controls.enabled = false;
        // Re-enable controls after the click event is done
        requestAnimationFrame(() => {
            controls.enabled = true;
        });
    }
  }, true);
  // auto rotate
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;

  setupThree(); // ***

  renderer.setAnimationLoop(animate);
}

function animate() {
  controls.update();
  time = performance.now();
  frame++;

  updateThree(); // ***

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
