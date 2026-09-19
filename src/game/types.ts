export type SuspectId = "alex" | "jordan" | "sam" | "lucia";
export type ClueId = "dock" | "log" | "photo" | "badge" | "heat";
export type Position = [number, number, number];
export type TargetId = SuspectId | ClueId | "submission";
export interface Suspect {
  id: SuspectId;
  name: string;
  role: string;
  color: string;
  position: Position;
  opening: string;
}
export interface Clue {
  id: ClueId;
  title: string;
  category: string;
  position: Position;
  description: string;
  icon: string;
  grants?: ClueId[];
}
export interface Message {
  role: "player" | "suspect";
  text: string;
  translation?: string;
}
export interface SaveGame {
  version: 1;
  clues: ClueId[];
  histories: Record<SuspectId, Message[]>;
  solved: boolean;
}
