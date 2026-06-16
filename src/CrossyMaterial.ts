import {
  MeshLambertMaterial,
  NearestFilter,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from "three";

export default class CrossyMaterial extends MeshLambertMaterial {
  static async loadAsync(
    resource: any
  ): Promise<MeshLambertMaterial> {
    const loader = new TextureLoader();
    const uri = typeof resource === "string" ? resource : (resource && resource.uri ? resource.uri : "");
    const texture = await loader.loadAsync(uri);
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    texture.colorSpace = SRGBColorSpace;
    return new MeshLambertMaterial({ map: texture });
  }
}
