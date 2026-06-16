import { Box3, Vector3, Object3D } from "three";

export function scaleLongestSideToSize(obj: Object3D, size: number) {
  const box = new Box3().setFromObject(obj);
  const sizeVec = new Vector3();
  box.getSize(sizeVec);
  const longest = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
  if (longest > 0) {
    const factor = size / longest;
    obj.scale.multiplyScalar(factor);
  }
}

export function alignMesh(obj: Object3D, alignment: { x: number; y: number; z: number } = { x: 0.5, y: 1.0, z: 0.5 }) {
  const box = new Box3().setFromObject(obj);
  const center = new Vector3();
  box.getCenter(center);
  const size = new Vector3();
  box.getSize(size);

  const offsetX = -center.x + size.x * (0.5 - alignment.x);
  const offsetZ = -center.z + size.z * (0.5 - alignment.z);
  const offsetY = -box.min.y; // Align bottom edge to y=0

  obj.traverse((child) => {
    if (child !== obj && child.parent === obj) {
      child.position.x += offsetX;
      child.position.y += offsetY;
      child.position.z += offsetZ;
    }
  });
}
