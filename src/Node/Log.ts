import Generic from './Generic';
import { Group, Mesh, BoxGeometry, MeshLambertMaterial } from "three";

export default class Log extends Generic {
  setup = async () => {
    for (let i = 0; i < 4; i++) {
      const node = new Group();

      // Main log body — wide enough to ride, brown wood color
      const logWidth = 3.0 + Math.random() * 0.8; // 3.0 – 3.8 units wide
      const logGeo = new BoxGeometry(logWidth, 0.35, 0.7);
      const logMat = new MeshLambertMaterial({ color: 0x8b5a2b });
      const logMesh = new Mesh(logGeo, logMat);
      logMesh.position.y = 0.175;
      logMesh.castShadow = true;
      logMesh.receiveShadow = true;
      node.add(logMesh);

      // Darker end caps to make it look like a cut log
      const capGeo = new BoxGeometry(0.12, 0.35, 0.7);
      const capMat = new MeshLambertMaterial({ color: 0x5c3a1e });
      for (const xOff of [-logWidth / 2, logWidth / 2]) {
        const cap = new Mesh(capGeo, capMat);
        cap.position.set(xOff, 0.175, 0);
        node.add(cap);
      }

      // Wood grain lines (thin dark strips on top)
      const grainGeo = new BoxGeometry(logWidth, 0.02, 0.1);
      const grainMat = new MeshLambertMaterial({ color: 0x6b4020 });
      for (const zOff of [-0.2, 0, 0.2]) {
        const grain = new Mesh(grainGeo, grainMat);
        grain.position.set(0, 0.36, zOff);
        node.add(grain);
      }

      this.models[`${i}`] = node;
    }
    return this.models;
  };
}
