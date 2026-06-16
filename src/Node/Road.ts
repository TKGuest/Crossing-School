import Generic from './Generic';
import { Group, Mesh, BoxGeometry, MeshLambertMaterial } from "three";

export default class Road extends Generic {
  setup = async () => {
    for (let i = 0; i < 2; i++) {
      const node = new Group();

      // A dark grey road block spanning the width of the screen
      const geo = new BoxGeometry(30, 0.4, 1);
      const mat = new MeshLambertMaterial({ color: 0x333333 });
      const mesh = new Mesh(geo, mat);
      mesh.position.y = -0.2; // Slightly below ground level
      mesh.receiveShadow = true;

      node.add(mesh);
      this.models[`${i}`] = node;
    }
    return this.models;
  };
}
