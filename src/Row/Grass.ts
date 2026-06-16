import {
  Object3D,
  Mesh,
  BoxGeometry,
  MeshLambertMaterial,
  CylinderGeometry,
  Group,
  Shape,
  ShapeGeometry,
  DoubleSide,
  SphereGeometry,
  ConeGeometry,
} from "three";

import ModelLoader from "../ModelLoader";

export const Fill = {
  empty: "empty",
  solid: "solid",
  random: "random",
  school: "school",
};

const HAS_WALLS = true;
const HAS_OBSTACLES = true;
const HAS_VARIETY = true;
const makeMat = (color) => new MeshLambertMaterial({ color, side: DoubleSide });

function addBox(parent, size, position, color) {
  const mesh = new Mesh(new BoxGeometry(size[0], size[1], size[2]), makeMat(color));
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function createOpenBook() {
  const mesh = new Group();

  // Center spine
  const spineMat = makeMat(0x153552);
  const spine = new Mesh(new BoxGeometry(0.1, 0.06, 0.8), spineMat);
  spine.position.set(0, 0.03, 0);
  spine.castShadow = true;
  spine.receiveShadow = true;
  mesh.add(spine);

  // Left Cover Wing
  const leftCoverGroup = new Group();
  leftCoverGroup.position.set(-0.05, 0.04, 0);
  leftCoverGroup.rotation.z = 0.15; // Tilted upward a little
  const leftCover = new Mesh(new BoxGeometry(0.5, 0.04, 0.82), makeMat(0x1f4e79));
  leftCover.position.set(-0.25, 0, 0); // Origin at the spine edge
  leftCover.castShadow = true;
  leftCover.receiveShadow = true;
  leftCoverGroup.add(leftCover);

  // Left Pages block on top of left cover
  const leftPages = new Mesh(new BoxGeometry(0.46, 0.06, 0.76), makeMat(0xfffcf0));
  leftPages.position.set(-0.24, 0.05, 0);
  leftPages.castShadow = true;
  leftPages.receiveShadow = true;
  leftCoverGroup.add(leftPages);

  // Add some lines of text on the left pages
  const leftLines = [
    { size: [0.32, 0.012, 0.03], pos: [-0.24, 0.082, 0.22] },
    { size: [0.28, 0.012, 0.03], pos: [-0.22, 0.082, 0.12] },
    { size: [0.34, 0.012, 0.03], pos: [-0.25, 0.082, 0.02] },
    { size: [0.30, 0.012, 0.03], pos: [-0.23, 0.082, -0.08] },
    { size: [0.26, 0.012, 0.03], pos: [-0.21, 0.082, -0.18] },
    { size: [0.20, 0.012, 0.03], pos: [-0.18, 0.082, -0.28] }
  ];
  leftLines.forEach(line => {
    const lineMesh = new Mesh(new BoxGeometry(line.size[0], line.size[1], line.size[2]), makeMat(0x8fa3b5));
    lineMesh.position.set(line.pos[0], line.pos[1], line.pos[2]);
    leftCoverGroup.add(lineMesh);
  });

  mesh.add(leftCoverGroup);

  // Right Cover Wing
  const rightCoverGroup = new Group();
  rightCoverGroup.position.set(0.05, 0.04, 0);
  rightCoverGroup.rotation.z = -0.15; // Tilted upward a little (mirrored)
  const rightCover = new Mesh(new BoxGeometry(0.5, 0.04, 0.82), makeMat(0x1f4e79));
  rightCover.position.set(0.25, 0, 0); // Origin at the spine edge
  rightCover.castShadow = true;
  rightCover.receiveShadow = true;
  rightCoverGroup.add(rightCover);

  // Right Pages block on top of right cover
  const rightPages = new Mesh(new BoxGeometry(0.46, 0.06, 0.76), makeMat(0xfffcf0));
  rightPages.position.set(0.24, 0.05, 0);
  rightPages.castShadow = true;
  rightPages.receiveShadow = true;
  rightCoverGroup.add(rightPages);

  // Add some lines of text on the right pages
  const rightLines = [
    { size: [0.30, 0.012, 0.03], pos: [0.23, 0.082, 0.22] },
    { size: [0.34, 0.012, 0.03], pos: [0.25, 0.082, 0.12] },
    { size: [0.28, 0.012, 0.03], pos: [0.22, 0.082, 0.02] },
    { size: [0.32, 0.012, 0.03], pos: [0.24, 0.082, -0.08] },
    { size: [0.26, 0.012, 0.03], pos: [0.21, 0.082, -0.18] },
    { size: [0.18, 0.012, 0.03], pos: [0.17, 0.082, -0.28] }
  ];
  rightLines.forEach(line => {
    const lineMesh = new Mesh(new BoxGeometry(line.size[0], line.size[1], line.size[2]), makeMat(0x8fa3b5));
    lineMesh.position.set(line.pos[0], line.pos[1], line.pos[2]);
    rightCoverGroup.add(lineMesh);
  });

  mesh.add(rightCoverGroup);

  // Bookmark Red Ribbon down the middle crease
  const ribbonGroup = new Group();
  ribbonGroup.position.set(0, 0.06, 0);
  const ribbonPart1 = new Mesh(new BoxGeometry(0.05, 0.02, 0.78), makeMat(0xe63946));
  ribbonPart1.position.set(0, 0.01, 0.01);
  ribbonGroup.add(ribbonPart1);

  // Ribbon tail folding out of the bottom of the book
  const ribbonTail = new Mesh(new BoxGeometry(0.05, 0.02, 0.15), makeMat(0xe63946));
  ribbonTail.position.set(0, -0.03, 0.44);
  ribbonTail.rotation.x = 0.4; // Hanging down over the bottom cover edge
  ribbonGroup.add(ribbonTail);

  mesh.add(ribbonGroup);

  mesh.scale.set(0.7, 0.7, 0.7);
  mesh.userData = { collectibleType: "book" };
  return mesh;
}

function createStar() {
  const mesh = new Group();
  for (let i = 0; i < 5; i++) {
    const ray = new Mesh(new ConeGeometry(0.16, 0.42, 4), makeMat(0xffdf2d));
    ray.position.y = 0.25;
    ray.rotation.z = (i / 5) * Math.PI * 2;
    ray.rotation.x = Math.PI / 2;
    mesh.add(ray);
  }
  const core = new Mesh(new SphereGeometry(0.22, 16, 10), makeMat(0xfff15a));
  core.position.y = 0.25;
  mesh.add(core);
  mesh.userData = { collectibleType: "star" };
  return mesh;
}

function createFreeze() {
  const mesh = new Group();
  const mat = makeMat(0x9de8ff);
  for (let i = 0; i < 6; i++) {
    const arm = new Mesh(new BoxGeometry(0.08, 0.08, 0.72), mat);
    arm.position.y = 0.28;
    arm.rotation.y = (i / 6) * Math.PI;
    mesh.add(arm);
    addBox(mesh, [0.2, 0.06, 0.06], [0.28 * Math.cos((i / 6) * Math.PI), 0.28, 0.28 * Math.sin((i / 6) * Math.PI)], 0xcff7ff);
  }
  mesh.userData = { collectibleType: "freeze" };
  return mesh;
}

function createMagnet() {
  const mesh = new Group();
  addBox(mesh, [0.18, 0.42, 0.16], [-0.23, 0.26, 0], 0xe54242);
  addBox(mesh, [0.18, 0.42, 0.16], [0.23, 0.26, 0], 0xe54242);
  addBox(mesh, [0.64, 0.16, 0.16], [0, 0.46, 0], 0xd62f2f);
  addBox(mesh, [0.2, 0.08, 0.18], [-0.23, 0.02, 0], 0xdce8f2);
  addBox(mesh, [0.2, 0.08, 0.18], [0.23, 0.02, 0], 0xdce8f2);
  mesh.userData = { collectibleType: "magnet" };
  return mesh;
}

export default class Grass extends Object3D {
  [key: string]: any;
  active = false;
  entities = [];

  top = 0.4;
  /*

* Build Walls

* Random Fill Center
* Solid Fill Center
* Empty Fill Center


*/

  generate = (type = Fill.random, requiredClearPositions: number[] = []) => {
    this.entities.map((val) => {
      this.floor.remove(val.mesh);
      val = null;
    });
    this.entities = [];
    this.obstacleMap = {};
    this.collectibleMap = {};
    this.requiredClearPositions = new Set(requiredClearPositions);
    
    if (type === Fill.school) {
      const schoolGeo = new BoxGeometry(7, 3, 2);
      const schoolMat = new MeshLambertMaterial({ color: 0xcc4444 });
      const school = new Mesh(schoolGeo, schoolMat);
      school.position.set(0, 1.5, 0);
      
      const doorGeo = new BoxGeometry(1.5, 1.5, 2.1);
      const doorMat = new MeshLambertMaterial({ color: 0x8b5a2b });
      const door = new Mesh(doorGeo, doorMat);
      door.position.set(0, 0.75, 0);
      
      for (let i = -3; i <= 3; i++) {
        this.obstacleMap[`${i}`] = { index: this.entities.length };
      }
      this.entities.push({ mesh: school });
      this.floor.add(school);
      this.floor.add(door);

      this.addObstacle(-4);
      this.addObstacle(4);
      return;
    }

    this.treeGen(type);
  };

  obstacleMap = {};
  collectibleMap = {};
  requiredClearPositions: Set<number> = new Set();

  addCollectible = (x) => {
    if (this.requiredClearPositions.has(x | 0)) return;

    const mesh = new Group();
    const roll = Math.random();
    const type =
      roll < 0.15
        ? "book"
        : roll < 0.38
        ? "star"
        : roll < 0.54
        ? "freeze"
        : roll < 0.70
        ? "magnet"
        : roll < 0.85
        ? "pencil"
        : "backpack";

    if (type === "book") {
      mesh.add(createOpenBook());
    } else if (type === "star") {
      mesh.add(createStar());
    } else if (type === "freeze") {
      mesh.add(createFreeze());
    } else if (type === "magnet") {
      mesh.add(createMagnet());
    } else if (type === "pencil") {
      // Pencil (yellow cylinder with pink eraser and wood tip)
      const pencil = new Group();
      
      const bodyGeo = new CylinderGeometry(0.05, 0.05, 0.6, 6);
      const bodyMat = makeMat(0xffcc00);
      const body = new Mesh(bodyGeo, bodyMat);
      body.rotation.z = Math.PI / 2;
      pencil.add(body);

      const eraserGeo = new CylinderGeometry(0.05, 0.05, 0.1, 6);
      const eraserMat = makeMat(0xff99cc);
      const eraser = new Mesh(eraserGeo, eraserMat);
      eraser.position.x = -0.35;
      eraser.rotation.z = Math.PI / 2;
      pencil.add(eraser);

      const tipGeo = new CylinderGeometry(0.01, 0.05, 0.15, 6);
      const tipMat = makeMat(0xd2b48c);
      const tip = new Mesh(tipGeo, tipMat);
      tip.position.x = 0.375;
      tip.rotation.z = -Math.PI / 2;
      pencil.add(tip);

      pencil.position.set(0, 0.05, 0);
      pencil.rotation.y = Math.random() * Math.PI;
      mesh.add(pencil);
    } else {
      // Backpack (Brown leather)
      const packColor = 0x8b4513;
      const packGeo = new BoxGeometry(0.5, 0.6, 0.25);
      const packMat = makeMat(packColor);
      const pack = new Mesh(packGeo, packMat);
      pack.position.set(0, 0.3, 0);

      const pocketGeo = new BoxGeometry(0.4, 0.25, 0.1);
      const pocketMat = makeMat(0x6b300a);
      const pocket = new Mesh(pocketGeo, pocketMat);
      pocket.position.set(0, 0.15, 0.15); // Front pocket
      pack.add(pocket);

      const strapGeo = new BoxGeometry(0.1, 0.5, 0.05);
      const strapL = new Mesh(strapGeo, pocketMat);
      strapL.position.set(-0.15, 0.3, -0.15); // Left strap on the back
      pack.add(strapL);

      const strapR = new Mesh(strapGeo, pocketMat);
      strapR.position.set(0.15, 0.3, -0.15); // Right strap
      pack.add(strapR);

      mesh.add(pack);
    }

    mesh.userData.collectibleType = type;
    this.collectibleMap[`${x | 0}`] = {
      mesh,
      index: this.entities.length,
      type,
    };
    this.entities.push({ mesh });
    this.floor.add(mesh);
    mesh.position.set(x, 0, 0);
  };

  addObstacle = (x) => {
    // Don't add obstacles at positions that must be clear for a winnable path
    if (this.requiredClearPositions.has(x | 0)) {
      return;
    }

    let mesh;
    if (HAS_VARIETY) {
      mesh =
        Math.random() < 0.4
          ? ModelLoader._boulder.getRandom()
          : ModelLoader._tree.getRandom();
    } else {
      mesh = ModelLoader._tree.getRandom();
    }
    this.obstacleMap[`${x | 0}`] = { index: this.entities.length };
    this.entities.push({ mesh });
    this.floor.add(mesh);
    mesh.position.set(x, 0, 0);
  };

  // Returns all x positions that have obstacles
  getBlockedPositions = (): number[] => {
    return Object.keys(this.obstacleMap).map((k) => parseInt(k, 10));
  };

  treeGen = (type) => {
    // 0 - 8
    let _rowCount = 0;
    const count = Math.round(Math.random() * 2) + 1;
    for (let x = -3; x < 12; x++) {
      const _x = x - 4;
      if (type === Fill.solid) {
        this.addObstacle(_x);
        continue;
      }

      if (HAS_WALLS) {
        /// Walls
        if (x >= 9 || x <= -1) {
          this.addObstacle(_x);
          continue;
        }
      }

      if (HAS_OBSTACLES) {
        if (_rowCount < count) {
          if (_x !== 0 && Math.random() > 0.6) {
            if (Math.random() > 0.7) {
              this.addCollectible(_x);
            } else {
              this.addObstacle(_x);
            }
            _rowCount++;
          }
        }
      }
    }
  };

  update = (dt, hero) => {
    const time = Date.now() / 1000;
    for (let key in this.collectibleMap) {
      const item = this.collectibleMap[key];
      if (item && item.mesh) {
        // Spin and dutch angle tilt
        item.mesh.rotation.x = Math.sin(time * 2) * 0.2 + 0.3;
        item.mesh.rotation.y += 0.05;
        item.mesh.rotation.z = Math.cos(time * 2) * 0.2 + 0.3;

        // Float slightly above ground
        item.mesh.position.y = 0.4 + Math.sin(time * 4) * 0.15;
      }
    }
  };

  constructor(heroWidth: any, onCollide?: any) {
    super();
    this.onCollide = onCollide;
    const { _grass } = ModelLoader;

    this.floor = _grass.getNode();
    this.add(this.floor);
  }
}
