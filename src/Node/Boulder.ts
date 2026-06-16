import Generic from './Generic';
import { Group, Mesh, BoxGeometry, MeshLambertMaterial } from "three";

export default class Boulder extends Generic {
  setup = async () => {
    for (let i = 0; i < 2; i++) {
      const node = new Group();

      // Rock body — slightly randomized grey box
      const w = 0.5 + Math.random() * 0.2;
      const h = 0.3 + Math.random() * 0.15;
      const d = 0.4 + Math.random() * 0.2;
      const rockGeo = new BoxGeometry(w, h, d);
      const rockMat = new MeshLambertMaterial({ color: 0x888888 });
      const rock = new Mesh(rockGeo, rockMat);
      rock.position.y = h / 2;
      rock.castShadow = true;
      rock.receiveShadow = true;
      node.add(rock);

      // Slightly lighter top face highlight
      const topGeo = new BoxGeometry(w * 0.7, 0.04, d * 0.7);
      const topMat = new MeshLambertMaterial({ color: 0xaaaaaa });
      const top = new Mesh(topGeo, topMat);
      top.position.y = h + 0.02;
      node.add(top);

      this.models[`${i}`] = node;
    }
    return this.models;
  };
}
