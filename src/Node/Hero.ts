import Characters from "../Characters";
import Generic from "./Generic";
import { Group, Mesh, BoxGeometry, MeshLambertMaterial } from "three";

export default class Hero extends Generic {
  setup = async () => {
    for (let id of Object.keys(Characters)) {
      if (id in Characters) {
        let character = Characters[id];
        
        // Build a detailed programmatic student instead of downloading assets
        const node = new Group();

        // Head (Skin color)
        const headGeo = new BoxGeometry(0.5, 0.5, 0.5);
        const headMat = new MeshLambertMaterial({ color: 0xffccaa });
        const head = new Mesh(headGeo, headMat);
        head.position.y = 0.85;
        head.castShadow = true;
        node.add(head);

        // Hair (Black)
        const hairGeo = new BoxGeometry(0.52, 0.15, 0.52);
        const hairMat = new MeshLambertMaterial({ color: 0x111111 });
        const hair = new Mesh(hairGeo, hairMat);
        hair.position.y = 1.05;
        node.add(hair);

        // Body (White shirt)
        const bodyGeo = new BoxGeometry(0.4, 0.45, 0.3);
        const bodyMat = new MeshLambertMaterial({ color: 0xffffff });
        const body = new Mesh(bodyGeo, bodyMat);
        body.position.y = 0.45;
        body.castShadow = true;
        node.add(body);

        // Backpack (Blue)
        const packGeo = new BoxGeometry(0.35, 0.4, 0.15);
        const packMat = new MeshLambertMaterial({ color: 0x2255cc });
        const pack = new Mesh(packGeo, packMat);
        pack.position.set(0, 0.45, 0.2); // Backpack on the back
        node.add(pack);

        // Legs (Dark blue pants)
        const legGeo = new BoxGeometry(0.18, 0.3, 0.18);
        const legMat = new MeshLambertMaterial({ color: 0x112255 });
        
        const legL = new Mesh(legGeo, legMat);
        legL.position.set(0.1, 0.15, 0);
        node.add(legL);

        const legR = new Mesh(legGeo, legMat);
        legR.position.set(-0.1, 0.15, 0);
        node.add(legR);

        // Arms (Skin + sleeves)
        const armGeo = new BoxGeometry(0.12, 0.35, 0.12);
        const armL = new Mesh(armGeo, headMat);
        armL.position.set(0.28, 0.45, 0);
        node.add(armL);

        const armR = new Mesh(armGeo, headMat);
        armR.position.set(-0.28, 0.45, 0);
        node.add(armR);

        // Scale down to match game proportions
        node.scale.set(0.8, 0.8, 0.8);

        this.models[character.id] = node;
      }
    }
    return this.models;
  };

  getNode(key) {
    const node = super.getNode(key);
    return node;
  }
}
