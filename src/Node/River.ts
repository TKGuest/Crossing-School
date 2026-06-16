import Generic from './Generic';
import { Group, Mesh, BoxGeometry, MeshLambertMaterial } from "three";

export default class River extends Generic {
  setup = async () => {
    const node = new Group();
    
    // A blue water block spanning the width of the screen (approx 30 units)
    const geo = new BoxGeometry(30, 0.4, 1);
    const mat = new MeshLambertMaterial({ color: 0x3a90cd });
    const mesh = new Mesh(geo, mat);
    mesh.position.y = -0.2; // Slightly below ground level
    mesh.receiveShadow = true;
    
    node.add(mesh);
    this.models[`0`] = node;
    
    return this.models;
  };
}
