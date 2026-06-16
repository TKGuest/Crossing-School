import { Group, Mesh, BoxGeometry, MeshLambertMaterial, SphereGeometry } from "three";
import { scaleLongestSideToSize, alignMesh } from "./utils/three-utils";
const utils = { scaleLongestSideToSize, alignMesh };
import {
  BASE_ANIMATION_TIME,
  groundLevel,
  IDLE_DURING_GAME_PLAY,
  PLAYER_IDLE_SCALE,
  startingRow,
} from "./GameSettings";
import { gsap } from "gsap";

const normalizeAngle = (angle) => {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
};

class PlayerScaleAnimation {
  constructor(player: any) {
    const tl = gsap.timeline();

    tl.to(player.scale, {
      x: 1,
      y: 1.2,
      z: 1,
      duration: BASE_ANIMATION_TIME,
    })
      .to(player.scale, {
        x: 1.0,
        y: 0.8,
        z: 1,
        duration: BASE_ANIMATION_TIME,
      })
      .to(player.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: BASE_ANIMATION_TIME,
        ease: "bounce.out",
      });

    return tl as any;
  }
}

class PlayerIdleAnimation {
  constructor(player: any) {
    const tl = gsap.timeline({ repeat: -1 });

    tl.to(player.scale, {
      y: PLAYER_IDLE_SCALE,
      duration: 0.3,
      ease: "power1.in",
    }).to(player.scale, {
      y: 1,
      duration: 0.3,
      ease: "power1.out",
    });

    return tl as any;
  }
}

class PlayerPositionAnimation {
  constructor(player: any, { targetPosition, initialPosition, onComplete }: { targetPosition: any, initialPosition: any, onComplete: () => void }) {
    const tl = gsap.timeline({
      onComplete: () => onComplete(),
    });

    const delta = {
      x: targetPosition.x - initialPosition.x,
      z: targetPosition.z - initialPosition.z,
    };

    const inAirPosition = {
      x: initialPosition.x + delta.x * 0.75,
      y: targetPosition.y + 0.5,
      z: initialPosition.z + delta.z * 0.75,
    };

    tl.to(player.position, {
      ...inAirPosition,
      duration: BASE_ANIMATION_TIME,
    }).to(player.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: BASE_ANIMATION_TIME,
    });

    return tl as any;
  }
}

export default class CrossyPlayer extends Group {
  [key: string]: any;
  animations = [];
  aura = null;

  _character;

  setCharacter(character) {
    if (this._character === character) return;
    this._character = character;

    if (this.node) {
      this.remove(this.node);
    }

    const node = new Group();

    // Pants (Blue)
    const pantsGeo = new BoxGeometry(0.4, 0.4, 0.4);
    const pantsMat = new MeshLambertMaterial({ color: 0x2b52c9 });
    const pants = new Mesh(pantsGeo, pantsMat);
    pants.position.y = 0.2;
    node.add(pants);

    // Shirt (White)
    const shirtGeo = new BoxGeometry(0.4, 0.4, 0.4);
    const shirtMat = new MeshLambertMaterial({ color: 0xffffff });
    const shirt = new Mesh(shirtGeo, shirtMat);
    shirt.position.y = 0.6;
    node.add(shirt);

    // Head (Skin tone)
    const headGeo = new BoxGeometry(0.3, 0.3, 0.3);
    const headMat = new MeshLambertMaterial({ color: 0xffccaa });
    const head = new Mesh(headGeo, headMat);
    head.position.y = 0.95;
    node.add(head);

    // Backpack (Red)
    const packGeo = new BoxGeometry(0.2, 0.3, 0.2);
    const packMat = new MeshLambertMaterial({ color: 0xcc2222 });
    const pack = new Mesh(packGeo, packMat);
    pack.position.set(0, 0.6, -0.25);
    node.add(pack);

    utils.scaleLongestSideToSize(node, 1);
    utils.alignMesh(node, { x: 0.5, z: 0.5, y: 1.0 });
    this.node = node;
    this.add(node);

    if (!this.aura) {
      const aura = new Mesh(
        new SphereGeometry(0.62, 24, 12),
        new MeshLambertMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.35,
        })
      );
      aura.position.y = 0.48;
      aura.visible = false;
      this.aura = aura;
      this.add(aura);
    }
  }

  constructor(character) {
    super();
    this.setCharacter(character);
    this.reset();
  }

  moveOnEntity() {
    if (!this.ridingOn) {
      return;
    }

    // let target = this._hero.ridingOn.mesh.position.x + this._hero.ridingOnOffset;
    this.position.x += this.ridingOn.currentSpeed ?? this.ridingOn.speed;
    this.initialPosition.x = this.position.x;
  }

  moveOnCar() {
    if (!this.hitBy) {
      return;
    }

    let target = this.hitBy.mesh.position.x;
    this.position.x += this.hitBy.speed;
    if (this.initialPosition) this.initialPosition.x = target;
  }

  stopAnimations() {
    this.animations.map((val) => {
      if (val.pause) {
        val.pause();
      }
      val = null;
    });
    this.animations = [];
  }

  reset() {
    this.position.set(0, groundLevel, startingRow);
    this.scale.set(1, 1, 1);
    this.rotation.set(0, Math.PI, 0);

    this.initialPosition = null;
    this.targetPosition = null;
    this.moving = false;
    this.hitBy = null;
    this.ridingOn = null;
    this.ridingOnOffset = null;
    this.isAlive = true;
    this.isInvincible = false;
    this.isFrozenAura = false;
    this.isMagnetized = false;
    if (this.aura) {
      this.aura.visible = false;
    }
  }

  setPowerAura(type) {
    if (!this.aura) return;
    this.aura.visible = Boolean(type);
    this.isFrozenAura = type === "freeze";
    if (type === "freeze") {
      this.aura.material.color.setHex(0x84d7ff);
      this.aura.material.opacity = 0.28;
    } else if (type === "star") {
      this.aura.material.opacity = 0.42;
    } else if (type === "magnet") {
      this.aura.material.color.setHex(0xff5ad8);
      this.aura.material.opacity = 0.28;
    }
  }

  clearPowerAura(type) {
    if (!this.aura) return;
    if (type === "star") {
      this.isInvincible = false;
    }
    if (type === "freeze") {
      this.isFrozenAura = false;
    }
    if (type === "magnet") {
      this.isMagnetized = false;
    }
    if (!this.isInvincible && !this.isFrozenAura && !this.isMagnetized) {
      this.aura.visible = false;
    }
  }

  updatePowerEffects() {
    if (!this.aura || !this.aura.visible) return;
    const time = Date.now() / 170;
    if (this.isInvincible) {
      const hue = (time % 360) / 360;
      this.aura.material.color.setHSL(hue, 1, 0.6);
    } else if (this.isFrozenAura) {
      this.aura.material.color.setHex(0x84d7ff);
    } else if (this.isMagnetized) {
      this.aura.material.color.setHex(0xff5ad8);
    }
    this.aura.scale.setScalar(1 + Math.sin(time * 0.25) * 0.08);
  }

  skipPendingMovement() {
    if (!this.moving) {
      return;
    }
    this.position.set(
      this.targetPosition.x,
      this.targetPosition.y,
      this.targetPosition.z
    );
    if (this.targetRotation) {
      this.rotation.y = normalizeAngle(this.targetRotation);
    }
    // return
  }

  finishedMovingAnimation() {
    this.moving = false;
    if (IDLE_DURING_GAME_PLAY) {
      if (this.idleAnimation) {
        this.idleAnimation.play();
      } else {
        this.idle();
      }
    }
    this.lastPosition = this.position;

    // this._hero.position.set(Math.round(this._hero.position.x), this._hero.position.y, Math.round(this._hero.position.z))
  }

  stopIdle() {
    if (this.idleAnimation && this.idleAnimation.pause) {
      this.idleAnimation.pause();
    }
    this.idleAnimation = null;
    this.scale.set(1, 1, 1);
  }

  idle() {
    if (this.idleAnimation) {
      return;
    }
    this.stopIdle();

    this.idleAnimation = new PlayerIdleAnimation(this);
  }

  createPositionAnimation({ onComplete }) {
    return new PlayerPositionAnimation(this, {
      onComplete: () => {
        this.finishedMovingAnimation();
        onComplete();
      },
      targetPosition: this.targetPosition,
      initialPosition: this.initialPosition,
    });
  }

  commitMovementAnimations({ onComplete }) {
    const positionChangeAnimation = this.createPositionAnimation({
      onComplete,
    });

    this.animations = [
      positionChangeAnimation,
      new PlayerScaleAnimation(this),
      gsap.to(this.rotation, {
        y: this.targetRotation,
        duration: BASE_ANIMATION_TIME,
        ease: "power1.inOut",
        // Reset angle when finished
        onComplete: () => (this.rotation.y = normalizeAngle(this.rotation.y)),
      }),
    ];

    this.initialPosition = this.targetPosition;
  }

  runPosieAnimation() {
    this.stopIdle();

    gsap.to(this.scale, {
      x: 1.2,
      y: 0.75,
      z: 1,
      duration: 0.2,
    });
  }

  hitBy = null;
  moving = false;

  collideWithCar(road, car) {
    if (
      this.moving &&
      Math.abs(this.position.z - Math.round(this.position.z)) > 0.1
    ) {
      this.getHitByCar(road, car);
    } else {
      this.getRunOverByCar(road, car);
    }
  }

  getRunOverByCar(road, car) {
    this.position.y = road.top - 0.05;

    gsap.to(this.scale, {
      y: 0.05,
      x: 1.7,
      z: 1.7,
      duration: 0.2,
    });
    gsap.to(this.rotation, {
      y: Math.random() * Math.PI - Math.PI / 2,
      duration: 0.2,
    });
  }

  getHitByCar(road, car) {
    this.hitBy = car;

    const forward = this.position.z - Math.round(this.position.z) > 0;
    this.position.z = road.position.z + (forward ? 0.52 : -0.52);

    gsap.to(this.scale, {
      y: 1.5,
      z: 0.2,
      duration: 0.15,
    });
    gsap.to(this.rotation, {
      z: Math.random() * Math.PI - Math.PI / 2,
      duration: 0.15,
    });
  }
}
