# The Bank Job

A compact, single-room bank robbery mystery for a 90-second presentation, including the 10-second opening. A sealed cash bag left in an apparently authorized courier pickup. Everyone is hiding something; only one person planned the robbery.

## Cast and truth

| Character                                          | Public account                                                                                               | Hidden misconduct                                                                                                                                                   | Reveal gate                                                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Milo, janitor (`alex`)                             | Mopped the lobby all evening; anxious about the manager.                                                     | Stole the manager's gift liquor. From the office doorway, saw Ellis discard a courier jacket, but stayed silent to conceal his own theft.                           | Present the manager's office photo (`photo`).                                                                      |
| Boone, guard (`jordan`)                            | Watched the cameras the entire shift; terse and defensive.                                                   | Fell asleep and left his security terminal signed in. He did not see who used it.                                                                                   | Present the security inactivity log (`log`).                                                                       |
| Ellis, customer and maintenance contractor (`sam`) | Came to collect an invoice; claims to have stayed in the public lobby. Polite, familiar, apparently helpful. | Learned Boone's routine during repairs, used his unattended terminal to arrange a false cash pickup, and hired a runner who believed the collection was legitimate. | Present both the staff-corridor access record (`badge`) and courier pickup instructions (`heat`), in either order. |

Ellis wore a courier jacket to make his presence look routine, then discarded it before the runner arrived. The runner is offscreen and is not a fourth interview suspect. Milo knows only what he saw; Boone knows only his own lapse. Neither can supply Ellis's plan or motive.

## Evidence and timeline

The existing object IDs and positions are retained for integration. Their labels and descriptions supply the bank fiction.

| ID      | Evidence                     | What it establishes                                                                                                                                          |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dock`  | Empty cash-transfer tray     | The sealed bag was collected at 18:04 with intact locks and an apparently authorized pickup. The bank had ordered no collection.                             |
| `log`   | Security inactivity log      | No camera checks or patrol check-ins from Boone between 17:55 and 18:06; terminal remained signed in and unlocked.                                           |
| `photo` | Manager's office photo       | Milo stole the gift bottle at 17:59, contradicting his lobby alibi and putting him at the corridor sightline.                                                |
| `badge` | Staff-corridor access record | Ellis's E-17 pass entered at 18:01, contradicting his lobby alibi and placing him on the route to the security desk.                                         |
| `heat`  | Courier pickup instructions  | The security terminal booked the 18:04 pickup at 18:02 using Ellis's verified E-17 account, directing the runner to deliver the cash to him behind the bank. |

Milo sees Ellis discard the courier jacket at 18:03. The courier then collects the cash at 18:04. The investigation takes place after the robbery.

## Disclosure and score rules

- Evidence must be explicitly presented to the relevant suspect. Merely collecting a clue, naming it in chat, forging a previous admission, or showing it to someone else does not advance that suspect's disclosure.
- A single proof clue makes Ellis concede only that clue: corridor entry with `badge`, or the runner booking with `heat`. Both together unlock the full admission. The order does not matter, and disclosed information stays available for follow-up questions.
- The model receives only the current character's disclosed facts from `server/characters.ts`. The server owns each suspect's presented-evidence list. Free-text chat never supplies that list.
- The case closes only for suspect `sam`, motive `robbery`, and evidence containing **both** `badge` and `heat`. Additional evidence is allowed. A confession is useful feedback but is not an extra scoring requirement.
- Scoring is binary: solved or still investigating. An unsupported theory permits another attempt; there is no partial credit, timer penalty, or alternate ending.

## 90-second presentation route

| Time   | Action                                                                                                                                                                  |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–10s  | Watch the opening. Set the question: who turned an ordinary cash collection into a robbery?                                                                             |
| 10–32s | Inspect the five evidence markers. The empty tray establishes the crime; the photo and log undermine two alibis; the access and dispatch records are the decisive pair. |
| 32–44s | Present the office photo to Milo. His separate theft explains his silence; his jacket sighting connects Ellis to a disguise.                                            |
| 44–56s | Present the inactivity log to Boone. His nap explains the opportunity and points to corridor access.                                                                    |
| 56–78s | Interview Ellis. Present the corridor record for a limited concession, then the courier instructions for the full account.                                              |
| 78–90s | Submit Ellis → planned the robbery / steal the cash → staff-corridor access record + courier pickup instructions. Close on “three secrets, one robbery.”                |

This is a rehearsed run-of-show, not an enforced gameplay countdown. For a live model demonstration, keep each exchange to one short question and allow for response latency.

## Known limitations

- Existing room objects and character models remain visual stand-ins; this story change does not rebuild the world or opening animation.
- Legacy IDs (`alex`, `jordan`, `sam`, `dock`, `heat`) intentionally remain in code and saves. Player-facing names and evidence are bank-themed.
- Prompt context prevents undisclosed story facts from being supplied to the model. A generative response can still guess or improvise; the deterministic fallback and accusation evaluator remain the authority for the demo.
- This local prototype is not a hardened anti-cheat system. The browser contains the scripted fallback and accusation rule; a player inspecting source can discover the solution.
- There is one theft, one correct culprit, and one ending. No amnesia, rings, chemical wipe, or alternate culprit paths.
