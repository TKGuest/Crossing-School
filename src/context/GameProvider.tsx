import AsyncStorage from "@react-native-async-storage/async-storage";
import * as React from "react";

import GameContext, { LeaderboardEntry } from "./GameContext";

const STORAGE_KEY = "@CrossySchool:State";
const SHOULD_REHYDRATE = true;

const defaultState = {
  character: "chicken",
  highscore: 0,
  playerName: "",
  leaderboard: [] as LeaderboardEntry[],
};

async function cacheAsync(value: typeof defaultState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

async function rehydrateAsync(): Promise<typeof defaultState> {
  if (!SHOULD_REHYDRATE || !AsyncStorage) {
    return defaultState;
  }
  try {
    const item = await AsyncStorage.getItem(STORAGE_KEY);
    const data = JSON.parse(item);
    return { ...defaultState, ...data };
  } catch {
    return defaultState;
  }
}

export default function GameProvider({ children }) {
  const [character, setCharacterState] = React.useState(defaultState.character);
  const [highscore, setHighscoreState] = React.useState(defaultState.highscore);
  const [playerName, setPlayerNameState] = React.useState(defaultState.playerName);
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>(defaultState.leaderboard);

  React.useEffect(() => {
    const parseModulesAsync = async () => {
      try {
        const saved = await rehydrateAsync();
        setHighscoreState(saved.highscore);
        if (saved.playerName) setPlayerNameState(saved.playerName);
        if (saved.leaderboard) setLeaderboard(saved.leaderboard);
      } catch (ignored) {}
    };

    parseModulesAsync();
  }, []);

  const saveAll = (patch: Partial<typeof defaultState>) => {
    const current = { character, highscore, playerName, leaderboard };
    cacheAsync({ ...current, ...patch });
  };

  const setCharacter = (newCharacter: string) => {
    setCharacterState(newCharacter);
    saveAll({ character: newCharacter });
  };

  const setHighscore = (newHighscore: number) => {
    setHighscoreState(newHighscore);
    saveAll({ highscore: newHighscore });
  };

  const setPlayerName = (name: string) => {
    const normalized = name.trim().toUpperCase();
    setPlayerNameState(normalized);
    saveAll({ playerName: normalized });
  };

  const addLeaderboardEntry = (name: string, score: number) => {
    const normalized = name.trim().toUpperCase();
    setLeaderboard((prev) => {
      // Find if same name exists — keep highest score only
      const filtered = prev.filter((e) => e.name !== normalized);
      const existing = prev.find((e) => e.name === normalized);
      const finalScore = existing ? Math.max(existing.score, score) : score;
      const newBoard = [...filtered, { name: normalized, score: finalScore }]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // keep top 10
      saveAll({ leaderboard: newBoard });
      return newBoard;
    });
  };

  return (
    <GameContext
      value={{
        character,
        setCharacter,
        highscore,
        setHighscore,
        playerName,
        setPlayerName,
        leaderboard,
        addLeaderboardEntry,
      }}
    >
      {children}
    </GameContext>
  );
}
