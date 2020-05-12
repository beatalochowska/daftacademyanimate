import { visibleHeightAtZDepth, visibleWidthAtZDepth, lerp } from "../utils.js";
import { nextSlide, previousSlide } from "../main.js";

const raycaster = new THREE.Raycaster();
const objLoader = new THREE.OBJLoader();
let arrowBox = null;
let arrowBox2 = null;
let arrowBoxRotation = 0;
let arrowBoxRotation2 = 0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight
);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

document.body.append(renderer.domElement);

const addCube = (object, callbackFn, x, y, radius, isSecondArrow) => {
  const cubeMesh = object.clone();

  cubeMesh.scale.setScalar(0.3);
  cubeMesh.rotation.set(THREE.Math.degToRad(radius), 0, 0);

  const boundingBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.7, 0.7),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
  );

  boundingBox.position.x = x;
  boundingBox.position.y = y;
  boundingBox.position.z = -10;

  boundingBox.add(cubeMesh);

  boundingBox.callbackFn = callbackFn;

  if (isSecondArrow) {
    arrowBox2 = boundingBox;
  } else {
    arrowBox = boundingBox;
  }
  scene.add(boundingBox);
};

const animate = () => {
  if (arrowBox && arrowBox.rotation) {
    arrowBoxRotation = lerp(arrowBoxRotation, 0, 0.07);
    arrowBox.rotation.set(THREE.Math.degToRad(arrowBoxRotation), 0, 0);
  }

  if (arrowBox2 && arrowBox2.rotation) {
    arrowBoxRotation2 = lerp(arrowBoxRotation2, 0, 0.07);
    arrowBox2.rotation.set(THREE.Math.degToRad(arrowBoxRotation2), 0, 0);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

export const handleThreeAnimation = () => {
  arrowBoxRotation = 360;
};

export const handleThreeAnimation2 = () => {
  arrowBoxRotation2 = 360;
};

objLoader.load("models/cube.obj", ({ children }) => {
  const screenBorderRight = visibleWidthAtZDepth(-10, camera) / 2;
  const screenBottom = -visibleHeightAtZDepth(-10, camera) / 2;

  addCube(
    children[0],
    previousSlide,
    screenBorderRight - 2.5,
    screenBottom + 1,
    270,
    false
  );

  animate();
});

objLoader.load("models/cube.obj", ({ children }) => {
  const screenBorderRight = visibleWidthAtZDepth(-10, camera) / 2;
  const screenBottom = -visibleHeightAtZDepth(-10, camera) / 2;

  addCube(
    children[0],
    nextSlide,
    screenBorderRight - 1.5,
    screenBottom + 1,
    90,
    true
  );

  animate();
});

window.addEventListener("click", () => {
  const mousePosition = new THREE.Vector2();
  mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mousePosition, camera);

  const intersectedObjects = raycaster.intersectObjects(scene.children);

  if (intersectedObjects.length) {
    intersectedObjects[0].object.callbackFn();
  }
});
