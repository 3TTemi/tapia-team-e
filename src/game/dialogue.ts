import type { ClueId, Message, SuspectId } from "./types";

export interface DialogueRequest {
  suspectId: SuspectId;
  message: string;
  presentedClue?: ClueId;
  presentedClues?: ClueId[];
  history: Message[];
}

export function scriptedReply({
  suspectId,
  message,
  presentedClue,
  presentedClues = [],
}: DialogueRequest): string {
  // Only explicit evidence presentation advances a character's disclosures.
  // Free text and conversation history never count as proof.
  if (suspectId === "lucia")
    return "Vi a un mensajero recoger una bolsa del banco. No vi su cara con claridad. Revisa el registro de recogida.";
  const shown = new Set(presentedClues);
  if (presentedClue) shown.add(presentedClue);

  if (suspectId === "alex") {
    if (shown.has("photo"))
      return "Fine. I stole the manager’s gift liquor. From his doorway, I saw Sam ditch a courier jacket by the staff corridor at 18:03. I kept quiet to hide my own theft. I never touched the cash.";
    if (presentedClue)
      return "I clean here. I don’t handle cash or security records. If you’ve got something showing where I was, let’s see it.";
    return /office|bottle|liquor|manager|steal/i.test(message)
      ? "The manager’s office? Closed, far as I know. Unless you’ve got a picture, I was in the lobby."
      : "Mopping the lobby. That’s my evening. The office camera sees that end of the bank, if you need to check.";
  }

  if (suspectId === "jordan") {
    if (shown.has("log"))
      return "All right. I fell asleep. The cameras ran, but I wasn’t watching, and I left the security terminal unlocked. Anyone reaching my desk could authorize a pickup. Check the staff-corridor access record.";
    if (presentedClue)
      return "That doesn’t tell you what happened at my desk. Check the security log. I followed procedure. Mostly.";
    return /sleep|nap|camera|terminal|watch/i.test(message)
      ? "Eyes on the cameras. Whole shift. If you’re challenging that, bring the security log."
      : "At my post, watching the cameras. Nobody reported trouble until the cash was gone. That’s my statement.";
  }

  if (shown.has("badge") && shown.has("heat"))
    return "I planned the robbery. Repair visits taught me Jordan’s routine. I used his unlocked terminal to send a runner for the cash. The courier jacket got me past a glance; I ditched it afterward. The runner thought it was a legitimate pickup.";
  if (shown.has("badge"))
    return "All right, I entered the staff corridor. A maintenance check. I should have said so. Being near the security desk doesn’t prove I ordered a cash pickup.";
  if (shown.has("heat"))
    return "Yes, I booked that runner. I handle collections for my repair work. A booking alone doesn’t place me at the bank’s security terminal.";
  if (presentedClue === "dock")
    return "No broken locks? Then someone made the pickup look official. There should be a dispatch record. Happy to help you find it.";
  if (presentedClue)
    return "That concerns someone else’s evening. I’m here about a repair invoice. Let’s stick to what the records actually show.";
  return /corridor|jacket|courier|robbery|cash|guilty/i.test(message)
    ? "I stayed in the public lobby. I know this place from repair jobs, but knowing a bank isn’t robbing it. What can you actually show me?"
    : "I’m a regular here, and I do their repairs. Tonight I came for an invoice. The guard and janitor know the evening routine better than anyone.";
}

export function evaluateAccusation(
  suspect: SuspectId,
  motive: string,
  evidence: ClueId[],
): boolean {
  return (
    suspect === "sam" &&
    motive === "robbery" &&
    evidence.includes("badge") &&
    evidence.includes("heat")
  );
}
