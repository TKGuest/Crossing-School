import React from "react";
import { StyleSheet, Text, Platform, View } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";
import GameContext from "@/context/GameContext";

function generateTextShadow(width) {
  return Platform.select({
    web: {
      textShadow: `-${width}px 0px 0px #000, ${width}px 0px 0px #000, 0px -${width}px 0px #000, 0px ${width}px 0px #000`,
    },
    default: {},
  });
}
const textShadow = generateTextShadow(4) as any;
const textShadowHighscore = generateTextShadow(2) as any;

export default function Score({ gameOver, score, ...props }) {
  const { highscore = 0, setHighscore, leaderboard } =
    React.useContext(GameContext);

  React.useEffect(() => {
    if (gameOver) {
      if (score > highscore) {
        setHighscore(score);
      }
    }
  }, [gameOver, highscore, score, setHighscore]);

  const { top, left } = useSafeArea();

  // Top player
  const topPlayer = leaderboard && leaderboard.length > 0 ? leaderboard[0] : null;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.outerContainer,
        { top: Math.max(top, 16) },
      ]}
    >
      {/* Left side: score + leaderboard leader */}
      <View style={[styles.leftContainer, { left: Math.max(left, 8) }]}>
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreLabel, textShadow]}>Điểm:</Text>
          <Text style={[styles.scoreNumber, textShadow]}>{score}</Text>
        </View>
        {highscore > 0 && (
          <Text style={[styles.highscore, textShadowHighscore]}>
            KỶ LỤC: {highscore}
          </Text>
        )}
        {topPlayer && (
          <Text style={[styles.topPlayer, textShadowHighscore]}>
            👑 {topPlayer.name}: {topPlayer.score}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    pointerEvents: "none",
  },
  leftContainer: {
    position: "absolute",
    gap: 6,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  scoreLabel: {
    color: "white",
    fontWeight: "900",
    fontSize: 30,
    backgroundColor: "transparent",
  },
  scoreNumber: {
    color: "white",
    fontWeight: "900",
    fontSize: 44,
    backgroundColor: "transparent",
    fontFamily: "retro",
  },
  highscore: {
    color: "yellow",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "transparent",
  },
  topPlayer: {
    color: "#ffd700",
    fontWeight: "bold",
    fontSize: 14,
    backgroundColor: "transparent",
  },
});
