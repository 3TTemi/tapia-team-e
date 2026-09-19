import { currentCharacterNames } from "../src/game/names";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ClueId, Message, SuspectId } from "../src/game/types";

export interface CharacterMemory {
  presented: ClueId[];
  history: Message[];
}
export interface Session {
  version: 2;
  collected: ClueId[];
  characters: Record<SuspectId, CharacterMemory>;
}
export const newSession = (): Session => ({
  version: 2,
  collected: [],
  characters: {
    alex: { presented: [], history: [] },
    jordan: { presented: [], history: [] },
    sam: { presented: [], history: [] },
    lucia: { presented: [], history: [] },
  },
});
export function createStore(directory = path.resolve(".data/interviews")) {
  const locks = new Set<string>();
  return {
    lock(id: string) {
      if (locks.has(id)) return false;
      locks.add(id);
      return true;
    },
    unlock(id: string) {
      locks.delete(id);
    },
    async read(id: string): Promise<Session> {
      try {
        const value = JSON.parse(
          await readFile(path.join(directory, `${id}.json`), "utf8"),
        );
        if (value.version !== 2) return newSession();
        value.characters.lucia ??= { presented: [], history: [] };
        for (const character of Object.values((value as Session).characters)) {
          for (const message of character.history) {
            message.text = currentCharacterNames(message.text);
            if (message.translation) message.translation = currentCharacterNames(message.translation);
          }
        }
        return value;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT")
          return newSession();
        throw error;
      }
    },
    async write(id: string, session: Session) {
      await mkdir(directory, { recursive: true });
      const temporary = path.join(directory, `${id}.${randomUUID()}.tmp`);
      await writeFile(temporary, JSON.stringify(session), { mode: 0o600 });
      await rename(temporary, path.join(directory, `${id}.json`));
    },
  };
}
