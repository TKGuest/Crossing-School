import { GLView } from "expo-gl";
import React, { Component } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  Text,
  TouchableOpacity,
  Vibration,
  View,
  useColorScheme,
} from "react-native";

import GestureRecognizer, { swipeDirections } from "@/components/GestureView";
import Score from "@/components/ScoreText";
import Engine from "@/GameEngine";
import State from "@/state";
import CharacterSelectScreen from "@/screens/CharacterSelectScreen";
import GameOverScreen from "@/screens/GameOverScreen";
import HomeScreen from "@/screens/HomeScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import GameContext from "@/context/GameContext";

const DEBUG_CAMERA_CONTROLS = false;

class Game extends Component {
  /// Reserve State for UI related updates...
  state = {
    ready: false,
    score: 0,
    viewKey: 0,
    gameState: State.Game.none,
    showSettings: false,
    showCharacterSelect: false,
    quiz: null,
    notice: "",
    activePowerUps: {},
    // gameState: State.Game.gameOver
  };

  transitionScreensValue = new Animated.Value(1);

  UNSAFE_componentWillReceiveProps(nextProps, nextState) {
    if (nextState.gameState && nextState.gameState !== this.state.gameState) {
      this.updateWithGameState(nextState.gameState, this.state.gameState);
    }
    if (this.engine && nextProps.character !== this.props.character) {
      this.engine._hero.setCharacter(nextProps.character);
    }
  }

  transitionToGamePlayingState = () => {
    Animated.timing(this.transitionScreensValue, {
      toValue: 0,
      useNativeDriver: true,
      duration: 200,
      onComplete: ({ finished }) => {
        this.engine.setupGame(this.props.character);
        this.engine.init();

        if (finished) {
          Animated.timing(this.transitionScreensValue, {
            toValue: 1,
            useNativeDriver: true,
            duration: 300,
          }).start();
        }
      },
    }).start();
  };

  updateWithGameState = (gameState) => {
    if (!gameState) throw new Error("gameState cannot be undefined");

    if (gameState === this.state.gameState) {
      return;
    }
    const lastState = this.state.gameState;

    this.setState({ gameState });
    this.engine.gameState = gameState;
    const { playing, gameOver, paused, none } = State.Game;
    switch (gameState) {
      case playing:
        if (lastState === paused) {
          this.engine.unpause();
        } else if (lastState !== none) {
          this.transitionToGamePlayingState();
        } else {
          // Coming straight from the menu.
          this.engine._hero.stopIdle();
          this.onSwipe(swipeDirections.SWIPE_UP);
        }

        break;
      case gameOver:
        break;
      case paused:
        this.engine.pause();
        break;
      case none:
        if (lastState === gameOver) {
          this.transitionToGamePlayingState();
        }
        this.newScore();

        break;
      default:
        break;
    }
  };

  componentWillUnmount() {
    cancelAnimationFrame(this.engine.raf);
    clearTimeout(this.noticeTimer);
    // Dimensions.removeEventListener("change", this.onScreenResize);
  }

  async componentDidMount() {
    // AudioManager.sounds.bg_music.setVolumeAsync(0.05);
    // await AudioManager.playAsync(
    //   AudioManager.sounds.bg_music, true
    // );

    Dimensions.addEventListener("change", this.onScreenResize);
  }

  onScreenResize = ({ window }) => {
    this.engine.updateScale();
  };

  UNSAFE_componentWillMount() {
    this.engine = new Engine();
    // this.engine.hideShadows = this.hideShadows;
    this.engine.onUpdateScore = (position) => {
      this.setState({ score: position });
    };
    this.engine.onGameInit = () => {
      this.setState({ score: 0 });
    };
    this.engine._isGameStateEnded = () => {
      return this.state.gameState !== State.Game.playing;
    };
    this.engine.onGameReady = () => this.setState({ ready: true });
    this.engine.onGameEnded = () => {
      this.setState({ gameState: State.Game.gameOver });
      // this.props.navigation.navigate('GameOver')
    };
    this.engine.onQuiz = (quiz) => {
      this.setState({ quiz });
    };
    this.engine.onNotice = (notice) => {
      clearTimeout(this.noticeTimer);
      this.setState({ notice });
      this.noticeTimer = setTimeout(() => {
        this.setState({ notice: "" });
      }, 1800);
    };
    this.engine.onPowerUpStateChange = (activePowerUps) => {
      this.setState({ activePowerUps });
    };
    this.engine.setupGame(this.props.character);
    this.engine.init();
  }

  newScore = () => {
    Vibration.cancel();
    // this.props.setGameState(State.Game.playing);
    this.setState({ score: 0 });
    this.engine.init();
  };

  onSwipe = (gestureName) => this.engine.moveWithDirection(gestureName);

  renderGame = () => {
    if (!this.state.ready) return;

    return (
      <GestureView
        pointerEvents={DEBUG_CAMERA_CONTROLS ? "none" : undefined}
        onStartGesture={this.engine.beginMoveWithDirection}
        onSwipe={this.onSwipe}
      >
        <GLView
          style={{ flex: 1, height: "100%", overflow: "hidden" }}
          onContextCreate={this.engine._onGLContextCreate}
        />
      </GestureView>
    );
  };

  renderGameOver = () => {
    if (this.state.gameState !== State.Game.gameOver) {
      return null;
    }

    return (
      <View style={StyleSheet.absoluteFillObject}>
        <GameOverScreen
          score={this.state.score}
          showSettings={() => {
            this.setState({ showSettings: true });
          }}
          setGameState={(state) => {
            this.updateWithGameState(state);
          }}
        />
      </View>
    );
  };

  renderHomeScreen = () => {
    if (this.state.gameState !== State.Game.none) {
      return null;
    }

    return (
      <View style={StyleSheet.absoluteFillObject}>
        <HomeScreen
          onPlay={() => {
            this.updateWithGameState(State.Game.playing);
          }}
          onShowCharacterSelect={() => {
            this.setState({ showCharacterSelect: true });
          }}
        />
      </View>
    );
  };

  renderSettingsScreen() {
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <SettingsScreen
          goBack={() => this.setState({ showSettings: false })}
          setCharacter={this.props.setCharacter}
        />
      </View>
    );
  }

  renderCharacterSelectScreen() {
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <CharacterSelectScreen
          navigation={{
            goBack: () => this.setState({ showCharacterSelect: false }),
          }}
          setCharacter={this.props.setCharacter}
        />
      </View>
    );
  }

  answerQuiz = (index) => {
    const { quiz } = this.state;
    if (!quiz) {
      return;
    }
    this.setState({ quiz: null });
    quiz.answer(index);
  };

  renderQuiz() {
    const { quiz } = this.state;
    if (!quiz) {
      return null;
    }

    return (
      <View style={styles.quizOverlay}>
        <View style={styles.quizCard}>
          <Text style={styles.quizTitle}>Open Book</Text>
          <Text style={styles.quizPrompt}>{quiz.prompt}</Text>
          {quiz.answers.map((answer, index) => (
            <TouchableOpacity
              key={answer}
              style={styles.quizAnswer}
              onPress={() => this.answerQuiz(index)}
              activeOpacity={0.85}
            >
              <Text style={styles.quizAnswerText}>
                {String.fromCharCode(65 + index)}. {answer}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  renderNotice() {
    if (!this.state.notice) {
      return null;
    }

    return (
      <View pointerEvents="none" style={styles.notice}>
        <Text style={styles.noticeText}>{this.state.notice}</Text>
      </View>
    );
  }

  renderPowerUpOverlay() {
    if (!this.state.activePowerUps?.freeze) {
      return null;
    }

    return (
      <View pointerEvents="none" style={styles.freezeOverlay}>
        <View style={[styles.iceShard, styles.iceShardTop]} />
        <View style={[styles.iceShard, styles.iceShardBottom]} />
        <View style={[styles.iceShard, styles.iceShardLeft]} />
        <View style={[styles.iceShard, styles.iceShardRight]} />
      </View>
    );
  }

  render() {
    const { isPaused } = this.props;

    return (
      <View
        pointerEvents="box-none"
        style={[
          StyleSheet.absoluteFill,
          { flex: 1, backgroundColor: "#87C6FF" },
          Platform.select({
            web: { position: "fixed" },
            default: { position: "absolute" },
          }),
          this.props.style,
        ]}
      >
        <Animated.View
          style={{ flex: 1, opacity: this.transitionScreensValue }}
        >
          {this.renderGame()}
        </Animated.View>
        <Score
          score={this.state.score}
          gameOver={this.state.gameState === State.Game.gameOver}
        />
        {this.renderGameOver()}

        {this.renderHomeScreen()}

        {this.state.showSettings && this.renderSettingsScreen()}

        {this.state.showCharacterSelect && this.renderCharacterSelectScreen()}

        {this.renderPowerUpOverlay()}

        {this.renderNotice()}

        {this.renderQuiz()}

        {isPaused && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: "rgba(105, 201, 230, 0.8)",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          />
        )}
      </View>
    );
  }
}

const GestureView = ({ onStartGesture, onSwipe, ...props }) => {
  const config = {
    velocityThreshold: 0.2,
    directionalOffsetThreshold: 80,
  };

  return (
    <GestureRecognizer
      onResponderGrant={() => {
        onStartGesture();
      }}
      onSwipe={(direction) => {
        onSwipe(direction);
      }}
      config={config}
      onTap={() => {
        onSwipe(swipeDirections.SWIPE_UP);
      }}
      style={{ flex: 1 }}
      {...props}
    />
  );
};

function GameScreen(props) {
  const scheme = useColorScheme();
  const { character, setCharacter } = React.useContext(GameContext);

  return (
    <Game
      {...props}
      character={character}
      setCharacter={setCharacter}
      isDarkMode={scheme === "dark"}
    />
  );
}

export default GameScreen;

const styles = StyleSheet.create({
  quizOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 20, 0.52)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  quizCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#f8fbff",
    borderRadius: 14,
    borderWidth: 4,
    borderColor: "#1c2b69",
    padding: 18,
    gap: 10,
  },
  quizTitle: {
    color: "#1c2b69",
    fontWeight: "900",
    fontSize: 24,
    textAlign: "center",
  },
  quizPrompt: {
    color: "#1f2937",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  quizAnswer: {
    backgroundColor: "#2f80ed",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  quizAnswerText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },
  notice: {
    position: "absolute",
    top: 92,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  noticeText: {
    color: "white",
    backgroundColor: "rgba(10, 20, 40, 0.78)",
    borderRadius: 10,
    overflow: "hidden",
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  freezeOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 7,
    borderColor: "rgba(119, 218, 255, 0.72)",
    backgroundColor: "rgba(130, 220, 255, 0.1)",
  },
  iceShard: {
    position: "absolute",
    width: 86,
    height: 18,
    backgroundColor: "rgba(210, 247, 255, 0.72)",
    borderRadius: 8,
  },
  iceShardTop: {
    top: 18,
    left: 24,
    transform: [{ rotate: "-18deg" }],
  },
  iceShardBottom: {
    bottom: 24,
    right: 20,
    transform: [{ rotate: "14deg" }],
  },
  iceShardLeft: {
    left: -20,
    top: "42%",
    transform: [{ rotate: "90deg" }],
  },
  iceShardRight: {
    right: -20,
    top: "56%",
    transform: [{ rotate: "90deg" }],
  },
});
