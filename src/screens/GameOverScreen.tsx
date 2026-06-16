import React from "react";
import {
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import State from "@/state";
import GameContext from "@/context/GameContext";

function GameOver({ score, ...props }) {
  const isVictory = score >= 91;
  const { width } = useWindowDimensions();
  const { playerName, leaderboard, addLeaderboardEntry } = React.useContext(GameContext);
  const [scoreAdded, setScoreAdded] = React.useState(false);

  const bannerData = [
    {
      color: isVictory ? "#1a9e3c" : "#3640eb",
      title: isVictory
        ? "🎉 CHÚC MỪNG! EM ĐÃ ĐẾN TRƯỜNG!"
        : "TRÒ CHƠI KẾT THÚC!",
    },
    {
      color: isVictory ? "#23c85e" : "#368FEB",
      title: isVictory ? `Xuất sắc! Điểm: ${score}` : `Điểm của bạn: ${score}`,
    },
  ];

  const [animations] = React.useState(bannerData.map(() => new Animated.Value(0)));

  React.useEffect(() => {
    // Save score exactly once
    if (!scoreAdded && score > 0 && playerName) {
      addLeaderboardEntry(playerName, score);
      setScoreAdded(true);
    }

    setTimeout(() => {
      const anims = animations.map((animation) =>
        Animated.timing(animation, {
          useNativeDriver: true,
          toValue: 1,
          duration: 1000,
          easing: Easing.elastic(1),
        })
      );
      Animated.stagger(300, anims).start();
    }, 400);

    function onKeyUp({ keyCode }) {
      // Space = restart
      if (keyCode === 32) {
        props.setGameState(State.Game.none);
      }
    }
    window.addEventListener("keyup", onKeyUp);
    return () => window.removeEventListener("keyup", onKeyUp);
  }, []);

  const { top, bottom, left, right } = useSafeAreaInsets();

  const renderBanner = ({ item: val, index }) => (
    <Animated.View
      style={[
        styles.bannerContainer,
        { backgroundColor: val.color, width },
        {
          transform: [
            {
              translateX: animations[index].interpolate({
                inputRange: [0.2, 1],
                outputRange: [-width, 0],
                extrapolate: "clamp",
              }),
            },
            {
              scaleY: animations[index].interpolate({
                inputRange: [0, 0.2],
                outputRange: [0, 1],
                extrapolate: "clamp",
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.bannerText} numberOfLines={2}>
        {val.title}
      </Text>
    </Animated.View>
  );

  const renderLeaderEntry = ({ item, index }) => (
    <View
      style={[
        styles.leaderRow,
        item.name === playerName && styles.leaderRowHighlight,
      ]}
    >
      <Text style={styles.leaderRank}>
        {index === 0 ? "👑" : `${index + 1}.`}
      </Text>
      <Text style={styles.leaderName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.leaderScore}>{item.score}</Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: top || 12, paddingBottom: bottom || 8 },
      ]}
    >
      {/* Banners */}
      <View style={{ overflow: "hidden" }}>
        {bannerData.map((val, index) => renderBanner({ item: val, index }))}
      </View>

      {/* Leaderboard */}
      <View style={styles.leaderboardContainer}>
        <Text style={styles.leaderboardTitle}>🏆 Bảng Xếp Hạng</Text>
        {leaderboard.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có điểm số nào.</Text>
        ) : (
          <FlatList
            data={leaderboard.slice(0, 6)}
            keyExtractor={(item) => item.name}
            renderItem={renderLeaderEntry}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Buttons */}
      <View style={[styles.footer, { paddingLeft: left || 4, paddingRight: right || 4 }]}>
        <TouchableOpacity
          style={[styles.footerBtn, { backgroundColor: "#2ecc71" }]}
          onPress={() => props.setGameState(State.Game.none)}
          activeOpacity={0.8}
        >
          <Text style={styles.footerBtnText}>🔄 Chơi lại</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.spaceHint}>Nhấn PHÍM CÁCH để chơi lại</Text>
    </View>
  );
}

export default GameOver;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,20,0.75)",
    gap: 16,
  },
  bannerContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    paddingHorizontal: 12,
    marginVertical: 4,
    overflow: "hidden",
  },
  bannerText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  leaderboardContainer: {
    marginHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  leaderboardTitle: {
    color: "#ffd700",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1,
  },
  leaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 8,
  },
  leaderRowHighlight: {
    backgroundColor: "rgba(255,215,0,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.5)",
  },
  leaderRank: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "700",
    width: 28,
  },
  leaderName: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  leaderScore: {
    color: "#ffd700",
    fontSize: 15,
    fontWeight: "900",
  },
  emptyText: {
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  footerBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  footerBtnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  spaceHint: {
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    fontSize: 12,
    marginBottom: 4,
  },
});
