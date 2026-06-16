import { Box3, Mesh, Vector3 } from "three";

import Models from "../Models";
import CrossyMaterial from "../CrossyMaterial";

function setShadows(mesh, { castShadow, receiveShadow }) {
  mesh.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = castShadow;
      child.receiveShadow = receiveShadow;
    }
  });

  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
}

export default class Generic {
  models: any = {};

  globalModels = Models;

  getSize = (mesh) => {
    let box = new Box3().setFromObject(mesh);
    const size = new Vector3();
    box.getSize(size);
    return size;
  };

  getWidth = (mesh) => {
    let box = new Box3().setFromObject(mesh);
    const size = new Vector3();
    box.getSize(size);
    return size.x;
  };

  _downloadAssets = async ({
    name,
    model,
    texture,
    castShadow,
    receiveShadow,
  }: any) => {
    return null as any;
  };

  getRandom = () => {
    let keys = Object.keys(this.models);
    const key = keys[(keys.length * Math.random()) << 0];
    return this.models[key].clone();
  };

  getNode(key = "0") {
    if (key in this.models) {
      return this.models[key].clone();
    } else {
      throw new Error(
        `Generic: Node with Key ${key} does not exist in ${JSON.stringify(
          Object.keys(this.models),
          null,
          2
        )}`
      );
    }
  }

  _register = async (key, props) => {
    return (this.models[key] = await this._download(props));
  };

  _download = async (props) => {
    return await this._downloadAssets(props);
  };

  setup = async () => {};
}
