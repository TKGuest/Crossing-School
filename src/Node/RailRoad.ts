import Generic from './Generic';
import { Group, Mesh, BoxGeometry, MeshLambertMaterial } from "three";

export default class RailRoad extends Generic {
  setup = async () => {
    const node = new Group();

    // Gravel/base for railroad
    const geo = new BoxGeometry(30, 0.38, 1);
    const mat = new MeshLambertMaterial({ color: 0x4a4a4a });
    const mesh = new Mesh(geo, mat);
    mesh.position.y = -0.19;
    mesh.receiveShadow = true;
    node.add(mesh);

    // Rails
    const railMat = new MeshLambertMaterial({ color: 0x999999 });
    const railGeo = new BoxGeometry(30, 0.05, 0.1);
    
    const rail1 = new Mesh(railGeo, railMat);
    rail1.position.set(0, 0.02, 0.3);
    node.add(rail1);

    const rail2 = new Mesh(railGeo, railMat);
    rail2.position.set(0, 0.02, -0.3);
    node.add(rail2);

    this.models[`0`] = node;
    return this.models;
  };
}
