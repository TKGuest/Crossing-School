import Generic from "./Generic";
import {
  Group,
  Mesh,
  BoxGeometry,
  MeshLambertMaterial,
  CylinderGeometry,
  SphereGeometry,
} from "three";

const colors = [
  0x111111, // black
  0x2b52c9, // blue car
  0x1c3a8e, // dark blue truck
  0x2d7a29, // green car
  0xcc6600, // orange car
  0x800080, // purple car
  0xcc0000, // red car
  0xffff00, // taxi yellow
];

const makeMat = (color) => new MeshLambertMaterial({ color });

const addBox = (parent, size, position, color) => {
  const mesh = new Mesh(new BoxGeometry(size[0], size[1], size[2]), makeMat(color));
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};

const addWheel = (parent, position, radius = 0.18, width = 0.1) => {
  const wheel = new Mesh(
    new CylinderGeometry(radius, radius, width, 16),
    makeMat(0x161616)
  );
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(position[0], position[1], position[2]);
  wheel.castShadow = true;
  parent.add(wheel);

  const hub = new Mesh(
    new CylinderGeometry(radius * 0.45, radius * 0.45, width + 0.02, 12),
    makeMat(0xd7dce8)
  );
  hub.rotation.z = Math.PI / 2;
  hub.position.copy(wheel.position);
  parent.add(hub);
};

const addDriver = (parent, position, scale = 1) => {
  const driver = new Group();
  addBox(driver, [0.18 * scale, 0.28 * scale, 0.14 * scale], [0, 0.22 * scale, 0], 0x2b52c9);
  const head = new Mesh(
    new SphereGeometry(0.11 * scale, 12, 8),
    makeMat(0xffccaa)
  );
  head.position.set(0, 0.45 * scale, 0.02 * scale);
  driver.add(head);
  addBox(driver, [0.24 * scale, 0.06 * scale, 0.08 * scale], [0, 0.34 * scale, 0.13 * scale], 0x333333);
  driver.position.set(position[0], position[1], position[2]);
  parent.add(driver);
  return driver;
};

const makeCar = (color, isTruck = false) => {
  const node = new Group();
  const bodyLen = isTruck ? 2.2 : 1.6;
  const topLen = isTruck ? 0.8 : 1.0;
  const topZ = isTruck ? 0.5 : 0;

  addBox(node, [0.85, 0.42, bodyLen], [0, 0.3, 0], color);
  addBox(node, [0.72, 0.36, topLen], [0, 0.7, topZ], color);
  addBox(node, [0.74, 0.2, topLen + 0.03], [0, 0.72, topZ], 0x8fd8ff);

  const wheelPositions = [
    [0.44, 0.18, -bodyLen / 2 + 0.3],
    [-0.44, 0.18, -bodyLen / 2 + 0.3],
    [0.44, 0.18, bodyLen / 2 - 0.3],
    [-0.44, 0.18, bodyLen / 2 - 0.3],
  ];
  wheelPositions.forEach((pos) => addWheel(node, pos));

  for (let x of [-0.25, 0.25]) {
    addBox(node, [0.15, 0.12, 0.06], [x, 0.35, bodyLen / 2 + 0.04], 0xffffff);
    addBox(node, [0.15, 0.12, 0.06], [x, 0.35, -bodyLen / 2 - 0.04], 0xff1010);
  }

  node.userData = { vehicle: "car", speedScale: isTruck ? 0.9 : 1 };
  return node;
};

const makeBus = () => {
  const node = new Group();
  const bodyLen = 3.15;
  addBox(node, [0.95, 0.62, bodyLen], [0, 0.42, 0], 0xffc928);
  addBox(node, [0.98, 0.12, bodyLen + 0.05], [0, 0.78, 0], 0xffde59);
  addBox(node, [0.78, 0.24, 0.5], [0, 0.62, 1.05], 0xaee8ff);
  addBox(node, [0.78, 0.24, 0.5], [0, 0.62, 0.35], 0xaee8ff);
  addBox(node, [0.78, 0.24, 0.5], [0, 0.62, -0.35], 0xaee8ff);
  addBox(node, [0.78, 0.24, 0.5], [0, 0.62, -1.05], 0xaee8ff);
  addBox(node, [0.82, 0.46, 0.08], [0, 0.46, bodyLen / 2 + 0.05], 0x38445c);
  addBox(node, [0.2, 0.42, 0.04], [0.32, 0.42, -0.2], 0x2d5c7c);
  addBox(node, [0.2, 0.42, 0.04], [0.32, 0.42, -0.55], 0x2d5c7c);
  [-1.18, 1.18].forEach((z) => {
    addWheel(node, [0.5, 0.16, z], 0.2, 0.12);
    addWheel(node, [-0.5, 0.16, z], 0.2, 0.12);
  });
  addDriver(node, [0.18, 0.38, 1.15], 0.8);
  node.userData = { vehicle: "bus", speedScale: 0.75 };
  return node;
};

const makeMotorbike = () => {
  const node = new Group();
  addBox(node, [0.18, 0.16, 0.9], [0, 0.36, 0], 0xd1192a);
  addBox(node, [0.24, 0.12, 0.28], [0, 0.48, -0.1], 0x202020);
  addBox(node, [0.46, 0.05, 0.1], [0, 0.55, 0.34], 0x202020);
  addBox(node, [0.08, 0.12, 0.22], [0, 0.46, 0.46], 0xffffff);
  addWheel(node, [0, 0.18, -0.43], 0.18, 0.08);
  addWheel(node, [0, 0.18, 0.43], 0.18, 0.08);
  addDriver(node, [0, 0.46, -0.05], 0.85);
  node.userData = { vehicle: "motorbike", speedScale: 1.35 };
  return node;
};

const makeBike = () => {
  const node = new Group();
  addBox(node, [0.08, 0.08, 0.78], [0, 0.35, 0], 0x2d7a29);
  addBox(node, [0.5, 0.05, 0.08], [0, 0.55, 0.3], 0x222222);
  addBox(node, [0.18, 0.08, 0.18], [0, 0.48, -0.08], 0x1f1f1f);
  addWheel(node, [0, 0.16, -0.38], 0.17, 0.06);
  addWheel(node, [0, 0.16, 0.38], 0.17, 0.06);
  addDriver(node, [0, 0.42, -0.08], 0.75);
  node.userData = { vehicle: "bike", speedScale: 0.55 };
  return node;
};

export default class Car extends Generic {
  setup = async () => {
    for (let index = 0; index < colors.length; index++) {
      const isTruck = index === 2 || index === 6;
      this.models[`${index}`] = makeCar(colors[index], isTruck);
    }
    this.models.bus = makeBus();
    this.models.motorbike = makeMotorbike();
    this.models.bike = makeBike();
    return this.models;
  };
}
