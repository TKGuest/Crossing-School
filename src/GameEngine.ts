const Dimensions = {
  get: (type?: string) => ({
    width: window.innerWidth,
    height: window.innerHeight,
    scale: window.devicePixelRatio || 1,
  }),
  addEventListener: (name: string, handler: any) => {
    if (name === "change") {
      window.addEventListener("resize", () => {
        handler({
          window: {
            width: window.innerWidth,
            height: window.innerHeight,
            scale: window.devicePixelRatio || 1,
          },
        });
      });
    }
  },
  removeEventListener: (name: string, handler: any) => {},
};

import { swipeDirections } from "@/components/GestureView";
import ProceduralAudio from "./ProceduralAudio";
import {
  CrossyCamera,
  CrossyGameMap,
  CrossyRenderer,
  CrossyScene,
} from "./CrossyGame";
import CrossyPlayer from "./CrossyPlayer";
import {
  CAMERA_EASING,
  DEBUG_CAMERA_CONTROLS,
  groundLevel,
  PI_2,
  sceneColor,
  startingRow,
} from "./GameSettings";

const normalizeAngle = (angle) => {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
};

const POWERUP_DURATION_MS = 5000;
const QUIZ_QUESTIONS = [
  {
    prompt: "Ai là tác giả của Áng văn thiên cổ hùng bút 'Bình Ngô Đại Cáo'?",
    answers: ["Nguyễn Du", "Nguyễn Trãi", "Trần Hưng Đạo", "Lê Lợi"],
    correctIndex: 1,
  },
  {
    prompt: "Hành tinh nào nằm gần Mặt Trời nhất trong Hệ Mặt Trời?",
    answers: ["Sao Kim", "Sao Hỏa", "Sao Thủy", "Trái Đất"],
    correctIndex: 2,
  },
  {
    prompt: "Sông nào dài nhất thế giới?",
    answers: ["Sông Nile", "Sông Amazon", "Sông Mê Kông", "Sông Trường Giang"],
    correctIndex: 0,
  },
  {
    prompt: "Kim loại duy nhất ở thể lỏng ở điều kiện nhiệt độ thường là gì?",
    answers: ["Sắt", "Thủy ngân", "Đồng", "Vàng"],
    correctIndex: 1,
  },
  {
    prompt: "Công thức hóa học của muối ăn hàng ngày là gì?",
    answers: ["NaCl", "H2O", "CO2", "HCl"],
    correctIndex: 0,
  },
  {
    prompt: "Tỉnh nào có diện tích lớn nhất Việt Nam hiện nay?",
    answers: ["Thanh Hóa", "Lâm Đồng", "Nghệ An", "Gia Lai"],
    correctIndex: 2,
  },
];

export default class Engine {
  [key: string]: any;
  updateScale = () => {
    const { width, height, scale } = Dimensions.get("window");
    if (this.camera) {
      this.camera.updateScale({ width, height, scale });
    }
    if (this.renderer) {
      this.renderer.setSize(width * scale, height * scale);
    }
  };

  setupGame = (character) => {
    this.scene = new CrossyScene({});

    this.camera = new CrossyCamera();

    if (DEBUG_CAMERA_CONTROLS) {
      // this.debugControls = new THREE.OrbitControls(this.camera);
    }

    this.scene.worldWithCamera.position.z = -startingRow;

    this.updateScale();

    this.gameMap = new CrossyGameMap({
      heroWidth: 0.7,
      scene: this.scene,
      onCollide: this.onCollide,
    });

    this.camCount = 0;
    this.activePowerUps = {};

    // Mesh
    this._hero = new CrossyPlayer(character);

    this.scene.world.add(this._hero);

    this.scene.createParticles();
  };

  isGameEnded() {
    return !this._hero.isAlive || this._isGameStateEnded();
  }

  onCollide = async (obstacle: any = {}, type = "feathers", collision?: any) => {
    if (this.isGameEnded()) {
      return;
    }
    if (this._hero.isInvincible && (collision === "car" || collision === "train")) {
      return;
    }
    this._hero.isAlive = false;
    this._hero.stopIdle();
    if (collision === "car") {
      ProceduralAudio.playGameOver();
    } else if (collision === "train") {
      ProceduralAudio.playGameOver();
    }
    this.scene.useParticle(this._hero, type, obstacle.speed);
    this.scene.rumble();
    this.gameOver();
  };

  // Setup initial scene
  init = () => {
    this.score = 0;
    this.maxZ = startingRow;
    this.activePowerUps = {};
    this.quizActive = false;
    this.onUpdateScore(this.score);
    this.onPowerUpStateChange?.({});
    this.onGameInit();

    this.camera.position.z = 1;
    this._hero.reset();

    this.scene.resetParticles(this._hero.position);

    this.camCount = 0;

    this.gameMap.reset();

    this._hero.idle();
    this._hero.clearPowerAura("star");
    this._hero.clearPowerAura("freeze");
    this._hero.clearPowerAura("magnet");
    this.gameMap.init();

    ProceduralAudio.startMusic();
    this.onGameReady();
  };

  // Move scene forward
  forwardScene = () => {
    this.scene.world.position.z -=
      (this._hero.position.z - startingRow + this.scene.world.position.z) *
      CAMERA_EASING;
    // Camera horizontal clamp
    const targetCameraX = Math.max(-3, Math.min(2, -this._hero.position.x));
    this.scene.world.position.x +=
      (targetCameraX - this.scene.world.position.x) * CAMERA_EASING;

    // normal camera speed
    if (-this.scene.world.position.z - this.camCount > 1.0) {
      this.camCount = -this.scene.world.position.z;
      this.gameMap.newRow();
    }
  };

  // Reset variables, restart game
  gameOver = () => {
    this._hero.moving = false;
    // Stop player from finishing a movement
    this._hero.stopAnimations();
    ProceduralAudio.stopMusic();
    this.onGameEnded();
    // this.gameState = State.Game.gameOver;

    // this.props.setGameState(this.gameState);
  };

  tick = (dt) => {
    // this.drive();
    this.updatePowerUps();
    this._hero.updatePowerEffects();
    const speedScale = this.activePowerUps.freeze ? 0.5 : 1;

    this.gameMap.tick(dt, this._hero, speedScale);

    if (this.activePowerUps.magnet) {
      this.gameMap
        .pullCollectibles(this._hero.position, 5)
        .forEach((item) => this.handleCollectible(item));
    }

    if (!this._hero.moving) {
      this._hero.moveOnEntity();
      this._hero.moveOnCar();
      this.checkIfUserHasFallenOutOfFrame();
    }
    this.forwardScene();
  };

  checkIfUserHasFallenOutOfFrame = () => {
    if (this.isGameEnded()) {
      return;
    }
    if (this._hero.position.z < this.camera.position.z - 1) {
      this.scene.rumble();
      ProceduralAudio.playGameOver();
      this.gameOver();
    }

    // Check if offscreen
    if (this._hero.position.x < -5 || this._hero.position.x > 5) {
      this.scene.rumble();
      ProceduralAudio.playGameOver();
      this.gameOver();
    }
  };

  pause() {
    cancelAnimationFrame(this.raf);
  }

  unpause() {
    const render = () => {
      this.raf = requestAnimationFrame(render);
      const time = Date.now();
      this.tick(time);
      this.renderer.render(this.scene, this.camera);

      // NOTE: At the end of each frame, notify `Expo.GLView` with the below
      this.renderer.__gl.endFrameEXP();
    };
    render();
  }

  updateScore = () => {
    
    if (Math.floor(this._hero.position.z) >= 99) {
      setTimeout(() => {
        this.gameOver();
      }, 500);
    }
  };

  changeScore = (delta) => {
    this.score = Math.max(0, this.score + delta);
    this.onUpdateScore(this.score);
  };

  updatePowerUps = () => {
    const now = Date.now();
    let changed = false;
    for (const type of Object.keys(this.activePowerUps || {})) {
      if (this.activePowerUps[type] <= now) {
        delete this.activePowerUps[type];
        changed = true;
        if (type === "star") {
          this._hero.isInvincible = false;
          this._hero.clearPowerAura("star");
        } else if (type === "freeze") {
          this._hero.clearPowerAura("freeze");
        } else if (type === "magnet") {
          this._hero.isMagnetized = false;
          this._hero.clearPowerAura("magnet");
        }
      }
    }
    if (changed) {
      this.onPowerUpStateChange?.({ ...this.activePowerUps });
    }
  };

  activatePowerUp = (type) => {
    this.activePowerUps[type] = Date.now() + POWERUP_DURATION_MS;
    if (type === "star") {
      this._hero.isInvincible = true;
      this._hero.setPowerAura("star");
      this.onNotice?.("Sức mạnh Ngôi sao! Bất tử trong 5 giây.");
    } else if (type === "freeze") {
      this._hero.setPowerAura("freeze");
      this.onNotice?.("Đóng băng! Mọi thứ chậm lại trong 5 giây.");
    } else if (type === "magnet") {
      this._hero.isMagnetized = true;
      this._hero.setPowerAura("magnet");
      this.onNotice?.("Nam châm! Hút vật phẩm xung quanh trong 5 giây.");
    }
    this.onPowerUpStateChange?.({ ...this.activePowerUps });
    ProceduralAudio.playCollect();
  };

  showQuizForBook = () => {
    if (this.quizActive) {
      return;
    }
    this.quizActive = true;
    const question =
      QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
    this.pause();
    this.onQuiz?.({
      ...question,
      answer: (index) => {
        const isCorrect = index === question.correctIndex;
        this.changeScore(isCorrect ? 10 : -3);
        this.onNotice?.(
          isCorrect ? "Chính xác! Bạn được thưởng 10 điểm." : "Sai rồi! Bạn bị trừ 3 điểm."
        );
        this.quizActive = false;
        this.unpause();
      },
    });
  };

  handleCollectible = (item) => {
    if (!item) {
      return;
    }
    switch (item.type) {
      case "book":
        this.showQuizForBook();
        break;
      case "star":
      case "freeze":
      case "magnet":
        this.activatePowerUp(item.type);
        break;
      default:
        this.changeScore(3);
        ProceduralAudio.playCollect();
        break;
    }
  };

  moveWithDirection = (direction) => {
    if (this.isGameEnded()) {
      return;
    }

    const { SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT } = swipeDirections;

    this._hero.ridingOn = null;

    if (!this._hero.initialPosition) {
      this._hero.initialPosition = this._hero.position;
      this._hero.targetPosition = this._hero.initialPosition;
    }

    this._hero.skipPendingMovement();

    let velocity = { x: 0, z: 0 };

    this._hero.targetRotation = normalizeAngle(this._hero.rotation.y);
    // const normalizedRotation = normalizeAngle(this._hero.rotation.y)
    switch (direction) {
      case SWIPE_LEFT:
        {
          this._hero.targetRotation = PI_2; // calculateRotation(targetRotation, Math.PI / 2);

          velocity = { x: 1, z: 0 };

          this._hero.targetPosition = {
            x: this._hero.initialPosition.x + 1,
            y: this._hero.initialPosition.y,
            z: this._hero.initialPosition.z,
          };
          this._hero.moving = true;
        }
        break;
      case SWIPE_RIGHT:
        {
          if (this._hero.targetPosition === 0) {
            this._hero.targetPosition = -PI_2;
          } else if (
            (this._hero.targetRotation | 0) !== -(PI_2 | 0) &&
            (this._hero.targetRotation | 0) !== ((Math.PI + PI_2) | 0)
          ) {
            this._hero.targetRotation = Math.PI + PI_2;
          }
          velocity = { x: -1, z: 0 };

          this._hero.targetPosition = {
            x: this._hero.initialPosition.x - 1,
            y: this._hero.initialPosition.y,
            z: this._hero.initialPosition.z,
          };
          this._hero.moving = true;
        }
        break;
      case SWIPE_UP:
        {
          this._hero.targetRotation = 0;
          let rowObject =
            this.gameMap.getRow(this._hero.initialPosition.z) || {};
          if (rowObject.type === "road") {
            // ProceduralAudio.playMove(); // Maybe train warning later
          }

          let shouldRound = true; // rowObject.type !== 'water';
          velocity = { x: 0, z: 1 };

          this._hero.targetPosition = {
            x: this._hero.initialPosition.x,
            y: this._hero.initialPosition.y,
            z: this._hero.initialPosition.z + 1,
          };

          if (shouldRound) {
            this._hero.targetPosition.x = Math.round(
              this._hero.targetPosition.x
            );
            const { ridingOn } = this._hero;
            if (ridingOn && ridingOn.dir) {
              if (ridingOn.dir < 0) {
                this._hero.targetPosition.x = Math.floor(
                  this._hero.targetPosition.x
                );
              } else if (ridingOn.dir > 0) {
                this._hero.targetPosition.x = Math.ceil(
                  this._hero.targetPosition.x
                );
              } else {
                this._hero.targetPosition.x = Math.round(
                  this._hero.targetPosition.x
                );
              }
            }
          }

          this._hero.moving = true;
        }
        break;
      case SWIPE_DOWN:
        {
          this._hero.targetRotation = Math.PI;
          let shouldRound = true; //row !== 'water';
          velocity = { x: 0, z: -1 };

          this._hero.targetPosition = {
            x: this._hero.initialPosition.x,
            y: this._hero.initialPosition.y,
            z: this._hero.initialPosition.z - 1,
          };
          if (shouldRound) {
            this._hero.targetPosition.x = Math.round(
              this._hero.targetPosition.x
            );
            const { ridingOn } = this._hero;
            if (ridingOn && ridingOn.dir) {
              if (ridingOn.dir < 0) {
                this._hero.targetPosition.x = Math.floor(
                  this._hero.targetPosition.x
                );
              } else if (ridingOn.dir > 0) {
                this._hero.targetPosition.x = Math.ceil(
                  this._hero.targetPosition.x
                );
              } else {
                this._hero.targetPosition.x = Math.round(
                  this._hero.targetPosition.x
                );
              }
            }
          }
          this._hero.moving = true;
        }
        break;
    }

    // Check collision using the computed movement.
    if (this.gameMap.treeCollision(this._hero.targetPosition)) {
      // If we collide with an object, then reset the target position so the character just jumps up.
      this._hero.targetPosition = {
        x: this._hero.initialPosition.x,
        y: this._hero.initialPosition.y,
        z: this._hero.initialPosition.z,
      };
      this._hero.moving = false;
      ProceduralAudio.playBlock();
    } else {
      this.handleCollectible(this.gameMap.checkCollectible(this._hero.targetPosition));
      
      const newZ = Math.round(this._hero.targetPosition.z);
      if (newZ > this.maxZ) {
        this.score += (newZ - this.maxZ);
        this.maxZ = newZ;
        this.onUpdateScore(this.score);
      }
    }

    const targetRow =
      this.gameMap.getRow(this._hero.initialPosition.z + velocity.z) || {};
    let finalY = targetRow.entity.top || groundLevel;
    // If the next move is into the river, then we want to jump into it.
    if (targetRow.type === "water") {
      const ridable = targetRow.entity.getRidableForPosition(
        this._hero.targetPosition
      );
      if (!ridable) {
        finalY = targetRow.entity.getPlayerSunkenPosition();
      } else {
        finalY =
          targetRow.entity.getPlayerLowerBouncePositionForEntity(ridable);
      }
    }

    ProceduralAudio.playMove();

    this._hero.targetPosition.y = finalY;

    this._hero.commitMovementAnimations({
      onComplete: () => this.updateScore(),
    });
  };

  beginMoveWithDirection = () => {
    if (this.isGameEnded()) {
      return;
    }
    this._hero.runPosieAnimation();
  };

  _onGLContextCreate = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    this.renderer = new CrossyRenderer({
      gl,
      antialias: true,
      width,
      height,
      clearColor: sceneColor,
    });

    this.unpause();
  };
}
