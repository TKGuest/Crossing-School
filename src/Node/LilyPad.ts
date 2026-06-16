import Generic from './Generic';
import { Group, Mesh, BoxGeometry, MeshLambertMaterial, CylinderGeometry } from "three";

export default class LilyPad extends Generic {
  setup = async () => {
    for (let i = 0; i < 4; i++) {
      const node = new Group();

      // Flat lily pad — use a flat cylinder (disc) approximated by a low-poly cylinder
      const padGeo = new CylinderGeometry(0.55, 0.55, 0.06, 10);
      const padMat = new MeshLambertMaterial({ color: 0x2d8a3e });
      const pad = new Mesh(padGeo, padMat);
      pad.position.y = 0.03;
      pad.castShadow = false;
      pad.receiveShadow = true;
      node.add(pad);

      // Small notch / cut on one side (darker wedge)
      const notchGeo = new BoxGeometry(0.22, 0.08, 0.28);
      const notchMat = new MeshLambertMaterial({ color: 0x1e6b2e });
      const notch = new Mesh(notchGeo, notchMat);
      notch.position.set(0.4, 0.03, 0);
      node.add(notch);

      // Small flower bud on top
      const budGeo = new CylinderGeometry(0.1, 0.1, 0.15, 6);
      const budMat = new MeshLambertMaterial({ color: 0xffdd44 });
      const bud = new Mesh(budGeo, budMat);
      bud.position.y = 0.12;
      node.add(bud);

      this.models[`${i}`] = node;
    }
    return this.models;
  };
}
