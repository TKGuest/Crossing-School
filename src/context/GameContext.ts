import { createContext } from "react";

export interface LeaderboardEntry {
  name: string;
  score: number;
}

export interface GameContextType {
  character: string;
  setCharacter: (character: string) => void;
  highscore: number;
  setHighscore: (score: number) => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  leaderboard: LeaderboardEntry[];
  addLeaderboardEntry: (name: string, score: number) => void;
}

export default createContext<GameContextType>({
  character: "chicken",
  setCharacter() {},
  highscore: 0,
  setHighscore() {},
  playerName: "",
  setPlayerName() {},
  leaderboard: [],
  addLeaderboardEntry() {},
});
