import Generic from './Generic';
import { Group, Mesh, BoxGeometry, CylinderGeometry, MeshLambertMaterial } from "three";

export default class TrainLight extends Generic {
  setup = async () => {
    // 0: inactive
    // active_0: lamp 1 on, lamp 2 off
    // active_1: lamp 1 off, lamp 2 on

    const createLightPole = (state: 'inactive' | 'active_0' | 'active_1') => {
      const node = new Group();

      // Gray vertical pole
      const poleGeo = new CylinderGeometry(0.08, 0.08, 1.2, 8);
      const poleMat = new MeshLambertMaterial({ color: 0x555555 });
      const pole = new Mesh(poleGeo, poleMat);
      pole.position.y = 0.6;
      pole.castShadow = true;
      node.add(pole);

      // Railroad crossing crossbuck sign on top (two crossed white rectangles)
      const signMat = new MeshLambertMaterial({ color: 0xeeeeee });

      const cross1 = new Mesh(new BoxGeometry(0.8, 0.12, 0.04), signMat);
      cross1.rotation.z = Math.PI / 4;
      cross1.position.set(0, 1.1, 0.02);
      node.add(cross1);

      const cross2 = new Mesh(new BoxGeometry(0.8, 0.12, 0.04), signMat);
      cross2.rotation.z = -Math.PI / 4;
      cross2.position.set(0, 1.1, 0.02);
      node.add(cross2);

      // Warning lights bar (horizontal backboard)
      const barGeo = new BoxGeometry(0.6, 0.15, 0.06);
      const barMat = new MeshLambertMaterial({ color: 0x222222 });
      const bar = new Mesh(barGeo, barMat);
      bar.position.set(0, 0.75, 0.04);
      node.add(bar);

      // Two rounded black backgrounds for the lamps
      const backGeo = new CylinderGeometry(0.15, 0.15, 0.04, 12);
      backGeo.rotateX(Math.PI / 2);
      
      const back1 = new Mesh(backGeo, barMat);
      back1.position.set(-0.2, 0.75, 0.08);
      node.add(back1);

      const back2 = new Mesh(backGeo, barMat);
      back2.position.set(0.2, 0.75, 0.08);
      node.add(back2);

      // The active bulb materials
      const lampRedMat = new MeshLambertMaterial({ color: 0xff0000, emissive: 0xff3333 });
      const lampDarkMat = new MeshLambertMaterial({ color: 0x330000 });

      // Left bulb
      const bulbGeo = new CylinderGeometry(0.08, 0.08, 0.04, 12);
      bulbGeo.rotateX(Math.PI / 2);

      const isLeftOn = state === 'active_0';
      const isRightOn = state === 'active_1';

      const leftBulb = new Mesh(bulbGeo, isLeftOn ? lampRedMat : lampDarkMat);
      leftBulb.position.set(-0.2, 0.75, 0.11);
      node.add(leftBulb);

      // Right bulb
      const rightBulb = new Mesh(bulbGeo, isRightOn ? lampRedMat : lampDarkMat);
      rightBulb.position.set(0.2, 0.75, 0.11);
      node.add(rightBulb);

      return node;
    };

    this.models['0'] = createLightPole('inactive');
    this.models['active_0'] = createLightPole('active_0');
    this.models['active_1'] = createLightPole('active_1');

    return this.models;
  };
}
