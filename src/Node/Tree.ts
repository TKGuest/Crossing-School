import Generic from "./Generic";
import { Group, Mesh, BoxGeometry, MeshLambertMaterial } from "three";

export default class Tree extends Generic {
  setup = async () => {
    for (let i = 0; i < 4; i++) {
      const node = new Group();

      // Trunk
      const trunkGeo = new BoxGeometry(0.3, 0.6, 0.3);
      const trunkMat = new MeshLambertMaterial({ color: 0x8b5a2b });
      const trunk = new Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.3; // Base at 0
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      node.add(trunk);

      // Leaves (multiple tiers for a pine-like look)
      const leafMat = new MeshLambertMaterial({ color: 0x228b22 });
      
      const leaf1Geo = new BoxGeometry(1.0, 0.5, 1.0);
      const leaf1 = new Mesh(leaf1Geo, leafMat);
      leaf1.position.y = 0.8;
      leaf1.castShadow = true;
      leaf1.receiveShadow = true;
      node.add(leaf1);

      const leaf2Geo = new BoxGeometry(0.8, 0.5, 0.8);
      const leaf2 = new Mesh(leaf2Geo, leafMat);
      leaf2.position.y = 1.2;
      leaf2.castShadow = true;
      leaf2.receiveShadow = true;
      node.add(leaf2);

      const leaf3Geo = new BoxGeometry(0.5, 0.5, 0.5);
      const leaf3 = new Mesh(leaf3Geo, leafMat);
      leaf3.position.y = 1.6;
      leaf3.castShadow = true;
      leaf3.receiveShadow = true;
      node.add(leaf3);

      this.models[`${i}`] = node;
    }
    return this.models;
  };
}
