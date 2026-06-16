import { Power2, TweenMax } from "gsap";
import { Object3D, Box3 } from "three";

import ModelLoader from "../ModelLoader";
import { disableDriftwood } from "../GameSettings";
import Foam from "../Particles/Foam";

export default class Water extends Object3D {
  [key: string]: any;
  active = false;
  entities = [];
  sineCount = 0;
  sineInc = Math.PI / 50;
  top = 0.25;
  lilyPadPositions: number[] = [];

  getWidth = (mesh) => {
    let box3 = new Box3();
    box3.setFromObject(mesh);
    // console.log( box.min, box.max, box.size() );
    return Math.round(box3.max.x - box3.min.x);
  };

  generate = (clearPositions: number[] = []) => {
    this.entities.map((val) => {
      this.floor.remove(val.mesh);
      val = null;
    });
    this.entities = [];
    this.lilyPadPositions = [];

    if (this.isStaticRow(this.position.z | 0)) {
      this.generateStatic(clearPositions);
    } else if (!disableDriftwood) {
      this.generateDynamic();
    }
  };

  // Returns all x positions that have lily pads (rounded to integers)
  getLilyPadPositions = (): number[] => {
    return this.lilyPadPositions;
  };

  generateStatic = (clearPositions: number[] = []) => {
    // Place 3-4 evenly distributed lily pads in the playable zone (-3..3)
    // so there is always a reachable one.
    const numItems = Math.floor(Math.random() * 2) + 3; // 3 or 4
    const zoneWidth = 6; // -3 to 3
    const spacing = zoneWidth / numItems;
    const positions: number[] = [];

    for (let i = 0; i < numItems; i++) {
      // Spread evenly with a little random jitter
      const base = -3 + spacing * i + spacing * 0.5;
      const jitter = (Math.random() - 0.5) * (spacing * 0.5);
      positions.push(Math.round(base + jitter));
    }

    // Store positions for coordination with adjacent rows
    this.lilyPadPositions = positions.map((p) => p | 0);

    let x = 0;
    for (const pos of positions) {
      if (this.entities.length - 1 < x) {
        let mesh = ModelLoader._lilyPad.getRandom();
        const width = this.getWidth(mesh);
        this.entities.push({
          mesh,
          top: 0.2,
          min: 0.01,
          mid: 0.125,
          dir: 0,
          width,
          collisionBox: this.heroWidth / 2 + width / 2 - 0.1,
        });
        this.floor.add(mesh);
      }

      this.entities[x].mesh.position.set(pos, 0.125, 0);
      this.entities[x].speed = 0;

      TweenMax.to(this.entities[x].mesh.rotation, Math.random() * 2 + 2, {
        y: Math.random() * 1.5 + 0.5,
        yoyo: true,
        repeat: -1,
        ease: Power2.easeInOut,
      });

      x++;
    }
  };

  generateDynamic = () => {
    // Guarantee playability: use 3-4 logs with max gap of 3.5 units
    // so the player can always jump from one to the next.
    let speed = Math.random() * 0.04 + 0.02; // 0.02 - 0.06 (slightly slower)
    let numItems = Math.floor(Math.random() * 2) + 3; // 3 or 4 logs
    let xDir = Math.random() > 0.5 ? 1 : -1;

    // Distribute logs evenly across the 22-unit wrap window
    const totalSpan = 22; // logs wrap from -11 to +11
    const spacing = totalSpan / numItems;

    for (let x = 0; x < numItems; x++) {
      if (this.entities.length - 1 < x) {
        let mesh = ModelLoader._log.getRandom();
        const width = this.getWidth(mesh);

        this.entities.push({
          mesh,
          top: 0.3,
          min: -0.3,
          mid: -0.1,
          dir: xDir,
          width,
          collisionBox: this.heroWidth / 2 + width / 2 - 0.1,
        });

        this.floor.add(mesh);
      }

      // Space evenly with a small jitter
      const baseX = -11 + spacing * x + spacing * 0.5;
      const jitter = (Math.random() - 0.5) * (spacing * 0.3);
      const xPos = baseX + jitter;

      this.entities[x].mesh.position.set(xPos, -0.1, 0);
      this.entities[x].speed = speed * xDir;
      this.entities[x].dir = xDir;
    }
  };

  bounce = ({ entity, player }) => {
    let timing = 0.2;

    TweenLite.to(entity.mesh.position, timing * 0.9, {
      y: entity.min,
    });

    TweenLite.to(entity.mesh.position, timing, {
      y: entity.mid,
      delay: timing,
    });

    TweenMax.to(player.position, timing * 0.9, {
      y: entity.top + entity.min,
    });

    TweenMax.to(player.position, timing, {
      y: entity.top + entity.mid,
      delay: timing,
    });
  };

  constructor(heroWidth, onCollide) {
    super();
    this.heroWidth = heroWidth;
    this.onCollide = onCollide;
    const { _river } = ModelLoader;

    this.floor = _river.getNode();
    this.add(this.floor);

    const foam = new Foam(1);
    foam.position.set(4.5, 0.2, -0.5);
    foam.visible = true;
    foam.run();
    this.add(foam);
    const foamRight = new Foam(-1);
    foamRight.position.set(-4.5, 0.2, -0.5);
    foamRight.visible = true;
    foamRight.run();
    this.add(foamRight);
  }

  ///Is Lily pad row (static) — only 25% of water rows to keep movement fair
  isStaticRow = (index) => {
    return index % 4 === 0;
  };

  update = (dt, player, speedScale = 1) => {
    if (!this.active) {
      return;
    }
    this.entities.map((entity) => this.move({ dt, player, entity, speedScale }));

    if (!player.moving && !player.ridingOn) {
      this.entities.map((entity) =>
        this.shouldCheckCollision({ player, entity })
      );
      this.shouldCheckHazardCollision({ player });
    }
  };

  move = ({ dt, player, entity, speedScale }) => {
    const offset = 11;

    entity.currentSpeed = entity.speed * speedScale;
    entity.mesh.position.x += entity.currentSpeed;

    if (entity.mesh.position.x > offset && entity.speed > 0) {
      entity.mesh.position.x = -offset;
    } else if (entity.mesh.position.x < -offset && entity.speed < 0) {
      entity.mesh.position.x = offset;
    } else {
    }
  };

  getRidableForPosition = (position) => {
    if (Math.round(position.z) !== this.position.z) {
      return null;
    }
    const log = this.getCollisionLog(position);
    return log;
  };

  // When the player jumps onto a lily or log we want it to be smooth, predict the position ahead of time.
  getPlayerLowerBouncePositionForEntity = (entity) => {
    return entity.top + entity.mid;
  };

  getPlayerSunkenPosition = () => {
    return Math.sin(this.sineCount) * 0.08 - 0.2;
  };

  shouldCheckHazardCollision = ({ player }) => {
    if (Math.round(player.position.z) === this.position.z && !player.moving) {
      if (!player.ridingOn) {
        if (player.isAlive) {
          this.onCollide(this.floor, "water");
        } else {
          let y = this.getPlayerSunkenPosition();
          this.sineCount += this.sineInc;
          player.position.y = y;
          player.rotation.y += 0.01;

          player.position.x += this.entities[0].speed;
        }
      }
    }
  };

  getCollisionLog = (position) => {
    for (const entity of this.entities) {
      const log = this.willCollideWithLog2D({ position, entity });
      if (log) {
        return log;
      }
    }
  };

  willCollideWithLog2D = ({ position, entity }) => {
    const { mesh, collisionBox } = entity;

    if (
      position.x < mesh.position.x + collisionBox &&
      position.x > mesh.position.x - collisionBox
    ) {
      return entity;
    }

    return null;
  };

  shouldCheckCollision = ({ player, entity }) => {
    if (Math.round(player.position.z) === this.position.z && player.isAlive) {
      const { mesh, collisionBox } = entity;

      if (
        player.position.x < mesh.position.x + collisionBox &&
        player.position.x > mesh.position.x - collisionBox
      ) {
        player.ridingOn = entity;
        player.ridingOnOffset = player.position.x - entity.mesh.position.x;
        this.bounce({ entity, player });
      }
    }
  };
}
