import { Box3, Group, Mesh, BoxGeometry, MeshLambertMaterial, CylinderGeometry } from "three";

import Generic from "./Generic";

export default class Train extends Generic {
  getDepth = (mesh) => {
    let box3 = new Box3();
    box3.setFromObject(mesh);

    return Math.round(box3.max.x - box3.min.x);
  };

  withSize = (size = 2) => {
    const _train = new Group();

    const front = this.getNode("front");
    _train.add(front);

    let offset = this.getDepth(front);
    for (let i = 0; i < size; i++) {
      const middle = this.getNode("middle");
      middle.position.x = offset;

      _train.add(middle);
      offset += this.getDepth(middle);
    }
    const back = this.getNode("back");
    back.position.x = offset;
    _train.add(back);

    return _train;
  };

  setup = async () => {
    const mainColor = 0xb22222; // Crimson Red train
    const roofColor = 0x222222; // Charcoal Dark
    const windowColor = 0xffde59; // Glowing yellow
    const metalColor = 0x888888; // Silver/Gray steel

    const addBox = (parent, size, position, color) => {
      const mesh = new Mesh(new BoxGeometry(size[0], size[1], size[2]), new MeshLambertMaterial({ color }));
      mesh.position.set(position[0], position[1], position[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    // --- FRONT (Engine) ---
    const buildFront = () => {
      const node = new Group();
      
      // Main boiler/engine cylinder-like box (Length X=2.5, Height Y=0.8, Width Z=0.8)
      addBox(node, [2.5, 0.7, 0.8], [1.25, 0.35, 0], mainColor);
      
      // Cabin on the back part of engine
      addBox(node, [0.9, 1.2, 0.84], [0.45, 0.6, 0], mainColor);
      
      // Cabin windows
      addBox(node, [0.5, 0.3, 0.86], [0.45, 0.8, 0], windowColor);
      
      // Cabin Roof
      addBox(node, [1.0, 0.1, 0.9], [0.45, 1.25, 0], roofColor);
      
      // Grill/front face (yellow or silver plate on the front)
      addBox(node, [0.08, 0.6, 0.7], [2.52, 0.35, 0], windowColor);
      
      // Smoke stack (classic chimney)
      const stack = new Mesh(new CylinderGeometry(0.12, 0.12, 0.4, 8), new MeshLambertMaterial({ color: roofColor }));
      stack.position.set(2.0, 0.8, 0);
      node.add(stack);

      // Warning headlight on the front
      addBox(node, [0.15, 0.15, 0.15], [2.52, 0.55, 0], 0xffffff);

      return node;
    };

    // --- MIDDLE (Passenger Carriage) ---
    const buildMiddle = () => {
      const node = new Group();
      
      // Base Carriage Box
      addBox(node, [2.5, 1.0, 0.8], [1.25, 0.5, 0], mainColor);
      
      // Roof
      addBox(node, [2.6, 0.1, 0.86], [1.25, 1.05, 0], roofColor);
      
      // Side windows on both sides
      for (let xOff = 0.4; xOff <= 2.1; xOff += 0.6) {
        addBox(node, [0.35, 0.25, 0.82], [xOff, 0.65, 0], windowColor);
      }
      
      // Coupling hook connections
      addBox(node, [0.2, 0.1, 0.2], [0, 0.1, 0], metalColor);
      addBox(node, [0.2, 0.1, 0.2], [2.5, 0.1, 0], metalColor);

      return node;
    };

    // --- BACK (Caboose) ---
    const buildBack = () => {
      const node = new Group();
      
      // Base Carriage
      addBox(node, [2.5, 1.0, 0.8], [1.25, 0.5, 0], mainColor);
      
      // Little observation cupola on top of roof
      addBox(node, [0.8, 0.3, 0.7], [1.25, 1.15, 0], mainColor);
      addBox(node, [0.86, 0.06, 0.76], [1.25, 1.32, 0], roofColor);

      // Windows
      addBox(node, [0.4, 0.15, 0.74], [1.25, 1.15, 0], windowColor);

      // Main roof
      addBox(node, [2.6, 0.1, 0.86], [1.25, 1.05, 0], roofColor);
      
      // Back red lantern light
      addBox(node, [0.12, 0.12, 0.12], [0.01, 0.7, 0], 0xff3333);

      return node;
    };

    this.models["front"] = buildFront();
    this.models["middle"] = buildMiddle();
    this.models["back"] = buildBack();

    return this.models;
  };
}
