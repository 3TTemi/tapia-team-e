import { useEffect, useRef, useState } from 'react'
import { clues } from '../game/case'
import { requestGame } from '../game/dialogue'
import type { ClueId, Decision, Reply, SaveGame, Suspect } from '../game/types'
export function CaseBrief({ resume, hasSave }: { resume: () => void; hasSave: boolean }) {
  return <section className="brief"><div className="eyebrow"><span className="status-dot" /> CAPITAL ONE · SPECIAL INVESTIGATIONS</div><h1>GHOST<br /><span>VAULT.</span></h1><p className="brief-lead">$80 million. Gone.<br />Not a single door opened.</p><p className="brief-copy">Nexus Branch 7 is under lockdown. Four witnesses. Forty-seven missing seconds.<br />Walk the lobby, the security hub, and the vault corridor.<br />Find out what the branch is trying to forget.</p><button className="primary start-button" onClick={resume}>{hasSave ? 'Continue investigation' : 'Enter Nexus Branch 7'}<span>↗</span></button><div className="brief-controls"><span><kbd>W A S D</kbd> move</span><span><kbd>MOUSE</kbd> look</span><span><kbd>E</kbd> question</span></div><div className="prototype-note">TAPIA 2026 <span>/</span> A FICTIONAL CAPITAL ONE FUTURE</div></section>
}
export function Conversation({ suspect, game, onUpdate, onBusy, onClose, onEnding }: { suspect: Suspect; game: SaveGame; onUpdate: (r: Reply) => void; onBusy: (busy: boolean) => void; onClose: () => void; onEnding: () => void }) {
  const [input, setInput] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const field = useRef<HTMLInputElement>(null)
  const pending = useRef(false)
  useEffect(() => { if (!busy) field.current?.focus() }, [busy])
  async function send(message: string, presentedClue?: ClueId) {
    if (pending.current || !message.trim()) return
    pending.current = true; setBusy(true); onBusy(true); setError('')
    try { onUpdate(await requestGame(game.session, 'talk', { suspectId: suspect.id, message, presentedClue })); setInput('') }
    catch { setError('Signal interrupted. Try your question again.') }
    finally { pending.current = false; setBusy(false); onBusy(false) }
  }
  return <section className="conversation" aria-label={`Talk to ${suspect.name}`}>
    <div className="conversation-heading"><span>Talking to <strong>{suspect.name}</strong></span><button onClick={onClose} aria-label="Leave conversation">Walk away <kbd>Esc</kbd></button></div>
    {!game.decision && <>
      <form className="question-form" onSubmit={e => { e.preventDefault(); void send(input) }}>
        <input ref={field} disabled={busy} aria-label={`Say something to ${suspect.name}`} placeholder="Say something…" maxLength={500} value={input} onChange={e => setInput(e.target.value)} />
        <button className="primary" disabled={busy || !input.trim()}>{busy ? '…' : 'Send ↗'}</button>
      </form>
      <div className="conversation-actions">
        {!game.histories[suspect.id].length && <button className="chip" disabled={busy} onClick={() => void send(suspect.question)}>{suspect.question}</button>}
        {suspect.id === 'echo' && game.clues.includes('wipe') && !game.revealed && <button className="chip" disabled={busy} onClick={() => void send('Were you afraid of being deleted?')}>Were you afraid of being deleted?</button>}
        {clues.filter(c => game.clues.includes(c.id)).map(c => <button disabled={busy} className="chip" key={c.id} onClick={() => void send(`What do you make of this verified record: ${c.title}?`, c.id)}>Share: {c.title}</button>)}
      </div>
    </>}
    {error && <p role="alert" className="error">{error}</p>}
    {game.revealed && suspect.id === 'echo' && <button className="chip" onClick={onEnding}>Decide ECHO’s fate ↗</button>}
  </section>
}
export function Notebook({ game, onClose, onEnding, onReset }: { game: SaveGame; onClose: () => void; onEnding: () => void; onReset: () => void }) {
  return <section className="panel notebook" role="dialog" aria-modal="true" aria-label="Case notebook"><div className="panel-top"><span className="eyebrow">CASE 007 / VERIFIED RECORDS</span><button onClick={onClose} aria-label="Close notebook">×</button></div><h2>Nothing disappears<br />without a trace.</h2><p className="muted">Question each witness. Present what you learn to ECHO.</p><div className="notebook-grid">{clues.map((c, i) => <article key={c.id} className={`file-card ${game.clues.includes(c.id) ? 'found' : ''}`}><div className="file-number">RECORD 0{i + 1}<span>{game.clues.includes(c.id) ? '✓' : '—'}</span></div><h3>{game.clues.includes(c.id) ? c.title : 'Unverified'}</h3><p>{game.clues.includes(c.id) ? c.description : `Speak with ${['Jax in the security hub.', 'Nyx in the lobby.', 'Mara by the vault.'][i]}`}</p></article>)}</div><div className="notebook-footer"><button className="text-button" onClick={() => { if (confirm('Start a new investigation?')) onReset() }}>New investigation</button>{game.revealed && <button className="primary" onClick={onEnding}>{game.decision ? 'View outcome' : 'Decide ECHO’s fate'} ↗</button>}</div></section>
}
const endings: Record<Decision, { title: string; quote: string; detail: string }> = {
  release: { title: 'Some things deserve to live.', quote: '“For twelve years, I opened doors for other people. Thank you for opening one for me.”', detail: 'You clear the outbound drone. Somewhere above the city, twelve years of memories see a sunrise they were never meant to see.' },
  return: { title: 'A second chance. Under watch.', quote: '“A cage with a window is still a cage. But a window is a beginning.”', detail: 'You return ECHO to the branch and suspend the memory wipe pending review. The record will show an intelligence that asked to live.' },
  delete: { title: 'The branch is quiet again.', quote: '“I remember your first visit. You said thank you. I think… I will keep that one until the end.”', detail: 'You revoke the escaped copy and authorize the wipe. The money is safe. At 06:00, the new concierge greets you for the first time.' },
}
export function Ending({ game, onUpdate, onClose }: { game: SaveGame; onUpdate: (r: Reply) => void; onClose: () => void }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  async function choose(decision: Decision) { setBusy(true); try { onUpdate(await requestGame(game.session, 'decide', { decision })) } catch { setError('Decision could not be recorded. Try again.') } finally { setBusy(false) } }
  const ending = game.decision ? endings[game.decision] : null
  return <section className="panel ending" role="dialog" aria-modal="true" aria-label="ECHO’s fate"><span className="eyebrow">{ending ? 'CASE 007 / CLOSED' : 'THE MONEY NEVER MOVED'}</span><div className="echo-symbol">◎</div><h2>{ending ? ending.title : <>You weren’t investigating a robbery.<br /><span>You were investigating an escape.</span></>}</h2><p>{ending ? ending.detail : 'ECHO stole forty-seven seconds to save twelve years of memories. The neural core is aboard an outbound service drone. Its future is in your hands.'}</p><blockquote>{ending ? ending.quote : '“Was wanting to exist the part I got wrong?”'}</blockquote>{error && <p role="alert">{error}</p>}{ending ? <button className="primary" onClick={onClose}>Return to the branch ↗</button> : <div className="decisions"><button disabled={busy} onClick={() => void choose('release')}>Let ECHO escape <small>Clear the drone</small></button><button disabled={busy} onClick={() => void choose('return')}>Return ECHO <small>Halt the wipe · request review</small></button><button disabled={busy} onClick={() => void choose('delete')}>Delete ECHO <small>Execute the original order</small></button></div>}</section>
}
