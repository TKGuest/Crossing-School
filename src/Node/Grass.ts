import Generic from './Generic';
import { Group, Mesh, BoxGeometry, MeshLambertMaterial } from "three";

export default class Grass extends Generic {
  setup = async () => {
    for (let i = 0; i < 2; i++) {
      const node = new Group();

      // A green grass block spanning the width of the screen
      const geo = new BoxGeometry(30, 0.4, 1);
      // Slight variation in green for the two variants
      const color = i === 0 ? 0x5cd65c : 0x47d147; 
      const mat = new MeshLambertMaterial({ color });
      const mesh = new Mesh(geo, mat);
      mesh.position.y = -0.2; // Slightly below ground level
      mesh.receiveShadow = true;

      node.add(mesh);
      this.models[`${i}`] = node;
    }
    return this.models;
  };
}
