import * as THREE from 'three';
import * as dat from 'dat.gui';
import plan from './data/2.json';

class Corner {
  constructor(x, y) {
    this.buildCorner(x, y);
  }

  buildCorner(x, y) {
    new Parallelepiped(25, 25, 120, x, y, 0, 'green');
  }
}

const materials = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, map: new THREE.TextureLoader().load('https://img.immoviewer.com/items/mnikitin/5ab27bc54cedfd0053a66a41/Tour/2688-images/srv_2gil2141r5.JPG?v=1521646584636')} );

class Parallelepiped extends THREE.Mesh {
  constructor(width, height, depth, centerX, centerY, rotation = 0, color = 'red') {
    super(new THREE.BoxGeometry(width, height, depth), materials);
    // super(new THREE.BoxGeometry(width, height, depth), new THREE.MeshBasicMaterial( { color: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})` } ),);
    // super(new THREE.BoxGeometry(width, height, depth), new THREE.MeshBasicMaterial( { color: 'red'} ));
    this.position.x = centerX;
    this.position.y = centerY;
    this.position.z = 0;
    this.rotation.z = rotation;
    this.addParallelepipedToScene();
  }

  addParallelepipedToScene() {
    scene.add(this);
  }
}

class Plane extends THREE.Mesh {
  constructor(width, height, centerX, centerY, rotation = 0, color = 'red') {
    super(new THREE.PlaneGeometry(width, height), materials);
    this.position.x = centerX;
    this.position.y = centerY;
    this.position.z = 0;
    this.rotation.x = rotation === 0 ? Math.PI / 2 : 0;
    this.rotation.y = rotation !== 0 ? Math.PI / 2 : 0;
    this.rotation.z = rotation;
    this.addPlaneToScene();
  }

  addPlaneToScene() {
    scene.add(this);
  }
}

class Wall {
  constructor(id) {
    this.startX = plan.corners.find(corner => corner.wallStarts.find(wallStarts => wallStarts.id === id)).x;
    this.startY = plan.corners.find(corner => corner.wallStarts.find(wallStarts => wallStarts.id === id)).y;
    this.endX = plan.corners.find(corner => corner.wallEnds.find(wallEnds => wallEnds.id === id)).x;
    this.endY = plan.corners.find(corner => corner.wallEnds.find(wallEnds => wallEnds.id === id)).y;
    this.centerX = (this.startX + this.endX) / 2;
    this.centerY = (this.startY + this.endY) / 2;
    this.wallLength = this.endX - this.startX + this.endY - this.startY;
    this.verticalR = this.endY - this.startY;
    this.horizontalR = this.endX - this.startX;
    // this.wallRotation= (this.horizontalR !== 0 ? this.verticalR / this.horizontalR : 0) + Math.PI / 2;
    this.wallRotation= Math.abs(this.verticalR) > Math.abs(this.horizontalR) ? Math.PI / 2 : 0;
    this.buildWall();
  }

  buildWall() {
    new Parallelepiped(this.wallLength, 25, 120, this.centerX, this.centerY, this.wallRotation);
    new Plane(this.wallLength, 120, this.centerX, this.centerY, this.wallRotation);
  }
}

class Camera extends THREE.PerspectiveCamera {
  constructor (x, y, z, rotationX, rotationY, rotationZ) {
    super (75, window.innerWidth / window.innerHeight, 0.1, 1200);
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
    this.rotation.x = rotationX;
    this.rotation.y = rotationY;
    this.rotation.z = rotationZ;
  }
}

const scene = new THREE.Scene();

const cameras = [new Camera(0, 0, 900, 0.1, 0.1, 0.3)];
plan.cameras.map(camera => cameras.push(new Camera(camera.x, camera.y, 0, 0, 0, camera.angle)));
window.cameraNum = 0;
const camera = cameras[cameraNum];

const cameraProps = {
  positionX: camera.position.x,
  positionY: camera.position.y,
  positionZ: camera.position.z,
  rotationX: camera.quaternion.x,
  rotationY: camera.quaternion.y,
  rotationZ: camera.quaternion.z,
};

const gui = new dat.GUI();
gui.add(cameraProps, 'positionX').min(-1000).max(1000).step(1);
gui.add(cameraProps, 'positionY').min(-1000).max(1000).step(1);
gui.add(cameraProps, 'positionZ').min(0).max(1000).step(1);
gui.add(cameraProps, 'rotationX').min(-Math.PI).max(Math.PI).step(.01);
gui.add(cameraProps, 'rotationY').min(-Math.PI).max(Math.PI).step(.01);
gui.add(cameraProps, 'rotationZ').min(-Math.PI).max(Math.PI).step(.01);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
document.body.appendChild(renderer.domElement);

const corners = plan.corners.map(corner => [{x: corner.x, y: corner.y}]);
corners.map((corner) => new Corner(corner[0].x, corner[0].y) );
plan.walls.map(wall => new Wall(wall.id));

function render() {
  camera.position.x = cameraProps.positionX;
  camera.position.y = cameraProps.positionY;
  camera.position.z = cameraProps.positionZ;
  camera.rotation.x = cameraProps.rotationX;
  camera.rotation.y = cameraProps.rotationY;
  camera.rotation.z = cameraProps.rotationZ;
	requestAnimationFrame(render);
  renderer.render(scene, camera);
}

render();
