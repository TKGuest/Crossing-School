import React from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GameContext from "@/context/GameContext";

let hasShownTitle = false;

function Screen({ onPlay }) {
  const { playerName, setPlayerName } = React.useContext(GameContext);
  const animation = React.useRef(new Animated.Value(0)).current;
  const [localName, setLocalName] = React.useState(playerName || "");
  const [nameError, setNameError] = React.useState(false);

  const handlePlay = React.useCallback(() => {
    const trimmed = localName.trim().toUpperCase();
    if (!trimmed) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setPlayerName(trimmed);
    onPlay();
  }, [localName, onPlay, setPlayerName]);

  React.useEffect(() => {
    function onKeyUp({ keyCode }) {
      // Space, up-arrow
      if ([32, 38].includes(keyCode)) {
        handlePlay();
      }
    }

    window.addEventListener("keyup", onKeyUp, false);
    return () => {
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [handlePlay]);

  React.useEffect(() => {
    if (!hasShownTitle) {
      hasShownTitle = true;

      Animated.timing(animation, {
        useNativeDriver: process.env.EXPO_OS !== "web",
        toValue: 1,
        duration: 800,
        delay: 0,
      }).start();
    }
  }, [animation]);

  const { top, bottom, left, right } = useSafeAreaInsets();

  const animatedTitleStyle = {
    transform: [
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [-Dimensions.get("window").width, 0],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [-100, 0],
        }),
      },
    ],
  } as any;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: top,
          paddingBottom: bottom,
          paddingLeft: left,
          paddingRight: right,
        },
      ]}
    >
      <View style={styles.titleArea} pointerEvents="none">
        <Animated.Text style={[styles.title, animatedTitleStyle]}>
          CROSSY SCHOOL
        </Animated.Text>
        <Text style={styles.subtitle}>Giúp học sinh đến trường!</Text>
      </View>

      {/* Name input panel */}
      <View style={styles.inputPanel}>
        <Text style={styles.inputLabel}>Nhập tên của bạn:</Text>
        <TextInput
          style={[styles.nameInput, nameError && styles.nameInputError]}
          value={localName}
          onChangeText={(text) => {
            setLocalName(text);
            setNameError(false);
          }}
          placeholder="Tên người chơi..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          maxLength={20}
          autoCapitalize="characters"
          onSubmitEditing={handlePlay}
          returnKeyType="go"
        />
        {nameError && (
          <Text style={styles.errorText}>Vui lòng nhập tên!</Text>
        )}

        <TouchableOpacity style={styles.playButton} onPress={handlePlay} activeOpacity={0.8}>
          <Text style={styles.playButtonText}>Chơi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Screen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    gap: 32,
  },
  titleArea: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: "retro",
    color: "white",
    fontSize: 42,
    backgroundColor: "transparent",
    textAlign: "center",
    textShadowColor: "black",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    maxWidth: 600,
    width: "90%",
    letterSpacing: 2,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  inputPanel: {
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxWidth: 360,
    alignItems: "center",
    gap: 12,
    ...Platform.select({
      web: {
        backdropFilter: "blur(8px)",
        border: "2px solid rgba(255,255,255,0.2)",
      },
    }),
  },
  inputLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    alignSelf: "flex-start",
  },
  nameInput: {
    width: "100%",
    height: 48,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    color: "white",
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 2,
    ...Platform.select({
      web: { outlineStyle: "none" } as any,
    }),
  },
  nameInputError: {
    borderColor: "#ff4444",
  },
  errorText: {
    color: "#ff6666",
    fontSize: 13,
    fontWeight: "600",
  },
  playButton: {
    marginTop: 4,
    backgroundColor: "#2ecc71",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  playButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
});
