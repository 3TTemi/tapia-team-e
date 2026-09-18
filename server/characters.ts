import { scriptedReply } from "../src/game/dialogue";
import type { ClueId, SuspectId } from "../src/game/types";

export interface CharacterContext {
  name: string;
  persona: string;
  facts: string[];
  fallback: string;
}

/** Only server-tracked evidence presented to this suspect may unlock facts. */
export function getCharacterContext(
  suspectId: SuspectId,
  presented: ClueId[],
): CharacterContext {
  const shown = new Set(presented);
  const fallback = scriptedReply({
    suspectId,
    message: "",
    history: [],
    presentedClues: presented,
  });

  if (suspectId === "alex") {
    return {
      name: "Milo",
      persona:
        "You are Milo, the bank janitor. Speak in short, fidgety, plain sentences. You worry about losing your job and dislike making a fuss. No noir monologues.",
      facts: [
        "The bank's sealed cash bag was collected during an unauthorized pickup at 18:04.",
        "You clean the bank; cash handling and security authorization are not your job.",
        ...(shown.has("photo")
          ? [
              "The office photo proves you were inside the manager's office at 17:59. Admit you stole the manager's gift bottle of liquor.",
              "From the office doorway, you saw Ellis discard a courier jacket beside the staff corridor at 18:03.",
              "You stayed quiet because reporting what you saw would expose your own liquor theft.",
              "You did not take the bank's cash and did not see who authorized or collected it. You cannot identify the planner's motive.",
            ]
          : [
              "Your current account is that you spent the evening mopping the lobby and never entered the manager's office. Maintain that account.",
              "If challenged, ask to see the manager's office photo. Do not add an eyewitness account or an admission.",
            ]),
      ],
      fallback,
    };
  }

  if (suspectId === "jordan") {
    return {
      name: "Boone",
      persona:
        "You are Boone, the bank's security guard. Speak in clipped, weary, defensive sentences. You lean on procedure and dislike looking incompetent. No noir monologues.",
      facts: [
        "The bank's sealed cash bag was collected during an unauthorized pickup at 18:04.",
        "Your duties include watching the cameras and checking the bank's security records.",
        ...(shown.has("log")
          ? [
              "The security log shows no camera checks or patrol check-ins from you between 17:55 and 18:06. Admit you fell asleep at your post.",
              "You left the security terminal signed in and unlocked. Anyone who reached your desk could authorize a cash pickup.",
              "The staff corridor leads to your desk; its access record can identify who entered.",
              "You did not witness the pickup or identify who used the terminal. You do not know who planned the robbery.",
            ]
          : [
              "Your current account is that you stayed at your post and watched the cameras throughout the evening. Maintain that account.",
              "If challenged, ask for the security inactivity log. Do not admit a lapse or speculate about anyone else's actions.",
            ]),
      ],
      fallback,
    };
  }

  const hasAccess = shown.has("badge");
  const hasDispatch = shown.has("heat");
  return {
    name: "Ellis",
    persona:
      "You are Ellis, a polite regular customer who also does maintenance for the bank. Sound ordinary, helpful, and composed. Answer in one or two concise sentences, without theatrical villain language.",
    facts: [
      "The bank's sealed cash bag was collected during an unauthorized pickup at 18:04.",
      "You have visited the bank for repair jobs before. Your contractor account and pass are E-17.",
      "You say you came this evening to collect payment for a repair invoice.",
      ...(hasAccess && hasDispatch
        ? [
            "Both the staff-corridor access record and courier pickup instructions have been explicitly presented to you. Admit that you planned the robbery to steal the bank's cash.",
            "Your repair visits taught you Boone's evening routine. At 18:01 you entered the staff corridor and used his unattended, unlocked security terminal.",
            "At 18:02 you booked a runner using your verified E-17 account to collect the sealed cash bag at 18:04 and bring it to you behind the bank.",
            "You wore a courier jacket to look authorized, then discarded it at 18:03. The runner believed the pickup was legitimate and did not plan the crime.",
          ]
        : [
            ...(hasAccess
              ? [
                  "The access record proves you entered the staff corridor at 18:01. Admit that your claim to have stayed in the lobby was false, and explain your entry as a maintenance check.",
                  "Point out that the access record alone does not establish that you ordered a cash pickup. Do not admit using the terminal or planning the crime.",
                ]
              : [
                  "Your current account is that you stayed in the public lobby. Maintain that account until shown the staff-corridor access record.",
                ]),
            ...(hasDispatch
              ? [
                  "The courier pickup instructions show that your E-17 account booked the runner. Acknowledge the booking, but claim it was routine logistics for your repair work.",
                  "Point out that the booking alone does not place you at the bank's security terminal. Do not explain how the pickup was authorized or admit planning a robbery.",
                ]
              : [
                  "Do not invent a courier booking or any activity beyond your current account. Ask for records that actually concern you.",
                ]),
          ]),
    ],
    fallback,
  };
}
