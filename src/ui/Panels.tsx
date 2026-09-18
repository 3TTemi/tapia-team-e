import { useEffect, useRef, useState } from 'react'
import { clues, suspects } from '../game/case'
import { evaluateAccusation, getReply } from '../game/dialogue'
import type { Clue, ClueId, Message, SaveGame, Suspect, SuspectId } from '../game/types'

export function CaseBrief({ resume, hasSave }: { resume: () => void; hasSave: boolean }) {
  return <section className="brief">
    <div className="eyebrow"><span className="status-dot" /> AN AFTER-HOURS MYSTERY</div>
    <h1>LAST<br /><span>COMMIT.</span></h1>
    <p className="brief-lead">One missing robot.<br />Three people with something to hide.</p>
    <p className="brief-copy">It’s 11:47 PM at the hackathon. Your prototype, Sparky, has vanished. Find the evidence. Question the room. Get your demo back.</p>
    <button className="primary start-button" onClick={resume}>{hasSave ? 'Continue investigation' : 'Enter the hackathon'} <span>↗</span></button>
    <div className="brief-controls"><span><kbd>W A S D</kbd> move</span><span><kbd>MOUSE</kbd> look</span><span><kbd>E</kbd> interact</span></div>
    <div className="prototype-note">PLAYABLE PROTOTYPE 01 <span>·</span> SCRIPTED CHARACTERS</div>
  </section>
}

export function CluePanel({ clue, onClose }: { clue: Clue; onClose: () => void }) {
  return <section className="panel clue-panel" role="dialog" aria-modal="true" aria-label={clue.title}>
    <div className="panel-top"><span className="eyebrow">EVIDENCE FILED</span><button onClick={onClose} aria-label="Close evidence">✕</button></div>
    <div className="evidence-art">{clue.icon}<span>EXHIBIT {String(clues.indexOf(clue) + 1).padStart(2, '0')}</span></div>
    <p className="eyebrow muted">{clue.category}</p><h2>{clue.title}</h2>
    <p className="clue-description">{clue.description}</p>
    <div className="hint-box">Added to your notebook. Present this to a suspect to challenge their story.</div>
    <button className="primary" onClick={onClose}>Back to the room <span>↗</span></button>
  </section>
}

export function DialoguePanel({ suspect, game, onMessages, onClose }: { suspect: Suspect; game: SaveGame; onMessages: (id: SuspectId, messages: Message[]) => void; onClose: () => void }) {
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const bottom = useRef<HTMLDivElement>(null)
  const history = game.histories[suspect.id]
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [history.length])
  async function send(message: string, presentedClue?: ClueId) {
    if (busy || !message.trim()) return
    setBusy(true); setError('')
    try {
      const reply = await getReply({ suspectId: suspect.id, message, presentedClue, history })
      onMessages(suspect.id, [...history, { role: 'player', text: message }, { role: 'suspect', text: reply }])
      setInput('')
    } catch { setError('The character could not respond. Your question is still here; try again.') }
    finally { setBusy(false) }
  }
  return <section className="panel dialogue-panel" role="dialog" aria-modal="true" aria-label={`Interview ${suspect.name}`}>
    <div className="panel-top"><span className="eyebrow">INTERVIEW / {suspect.role}</span><button onClick={onClose} aria-label="End interview">✕</button></div>
    <div className="suspect-heading"><div className="pixel-avatar" style={{ '--avatar-color': suspect.color } as React.CSSProperties}><i /></div><div><h2>{suspect.name}</h2><p><span className="status-dot" /> In conversation <span className="muted">· Scripted demo</span></p></div></div>
    <div className="messages" aria-live="polite">
      <div className="message suspect"><small>{suspect.name}</small><p>{suspect.opening}</p></div>
      {history.map((m, i) => <div key={i} className={`message ${m.role}`}><small>{m.role === 'player' ? 'YOU' : suspect.name}</small><p>{m.text}</p></div>)}
      {busy && <p className="muted">Thinking…</p>}<div ref={bottom} />
    </div>
    <div className="present-evidence"><span className="eyebrow muted">PRESENT EVIDENCE</span><div className="chip-row">
      {game.clues.length === 0 && <small>Inspect the golden markers around the room to collect clues.</small>}
      {clues.filter(c => game.clues.includes(c.id)).map(c => <button disabled={busy} className="chip" key={c.id} onClick={() => send(`Explain this: ${c.title}.`, c.id)}>{c.icon} {c.title}</button>)}
    </div></div>
    {history.length === 0 && <button className="suggestion" disabled={busy} onClick={() => send('Where were you when Sparky disappeared?')}>Ask: “Where were you when Sparky disappeared?” ↗</button>}
    {error && <p role="alert" className="error">{error}</p>}
    <form className="question-form" onSubmit={e => { e.preventDefault(); void send(input) }}>
      <input aria-label="Your question" placeholder="Ask about their alibi…" maxLength={500} value={input} onChange={e => setInput(e.target.value)} />
      <button className="primary" disabled={busy || !input.trim()} type="submit">Ask ↗</button>
    </form>
    <p className="panel-footnote">Starter dialogue uses evidence rules. Free-form AI conversations are the next team milestone.</p>
  </section>
}

export function Notebook({ game, onClose, onAccuse, onReset }: { game: SaveGame; onClose: () => void; onAccuse: () => void; onReset: () => void }) {
  return <section className="panel notebook" role="dialog" aria-modal="true" aria-label="Case notebook">
    <div className="panel-top"><span className="eyebrow">CASE 001 / FIELD NOTES</span><button onClick={onClose} aria-label="Close notebook">✕</button></div>
    <h2>Follow the evidence.</h2><p className="muted">Separate what people say from what you can prove.</p>
    <div className="notebook-grid">{clues.map((c, i) => <article key={c.id} className={game.clues.includes(c.id) ? 'file-card found' : 'file-card'}>
      <div className="file-number">EXHIBIT 0{i + 1}<span>{game.clues.includes(c.id) ? c.icon : '?'}</span></div>
      <h3>{game.clues.includes(c.id) ? c.title : 'Undiscovered evidence'}</h3>
      <p>{game.clues.includes(c.id) ? c.description : 'Explore the room. Look for a floating gold marker.'}</p>
    </article>)}</div>
    <div className="notebook-footer"><button className="text-button" onClick={onReset}>Reset case</button><button className="primary" onClick={onAccuse}>Make your case <span>↗</span></button></div>
  </section>
}

export function Accusation({ game, onSolve, onClose }: { game: SaveGame; onSolve: () => void; onClose: () => void }) {
  const [suspect, setSuspect] = useState<SuspectId>('alex')
  const [motive, setMotive] = useState('sabotage')
  const [evidence, setEvidence] = useState<ClueId[]>([])
  const [feedback, setFeedback] = useState('')
  return <section className="panel accusation" role="dialog" aria-modal="true" aria-label="Submit your conclusion">
    <div className="panel-top"><span className="eyebrow">YOUR FINAL THEORY</span><button onClick={onClose} aria-label="Close theory">✕</button></div>
    <h2>What happened to Sparky?</h2><p className="muted">A good detective can explain who, why, and the evidence that connects them.</p>
    <label>Who moved the robot?<select value={suspect} onChange={e => setSuspect(e.target.value as SuspectId)}>{suspects.map(s => <option key={s.id} value={s.id}>{s.name} — {s.role.toLowerCase()}</option>)}</select></label>
    <label>Why?<select value={motive} onChange={e => setMotive(e.target.value)}><option value="sabotage">To sabotage our demo</option><option value="copy">To copy our design</option><option value="safety">To deal with a battery safety issue</option></select></label>
    <fieldset><legend>Attach supporting evidence</legend>{game.clues.length === 0 && <p className="muted">Find evidence in the room first.</p>}{clues.filter(c => game.clues.includes(c.id)).map(c => <label className="checkbox-label" key={c.id}><input type="checkbox" checked={evidence.includes(c.id)} onChange={e => setEvidence(prev => e.target.checked ? [...prev, c.id] : prev.filter(id => id !== c.id))} />{c.title}</label>)}</fieldset>
    {feedback && <p role="status" className="hint-box">{feedback}</p>}
    <button className="primary" onClick={() => evaluateAccusation(suspect, motive, evidence) ? onSolve() : setFeedback('That theory isn’t supported yet. You need evidence of both the move and the reason behind it. Keep investigating; you can try again.')}>Submit conclusion <span>↗</span></button>
  </section>
}

export function Ending({ onClose }: { onClose: () => void }) {
  return <section className="panel ending" role="dialog" aria-modal="true" aria-label="Case solved">
    <div className="eyebrow"><span className="status-dot" /> CASE CLOSED</div>
    <div className="sparky-art"><div className="antenna" /><div className="robot-head"><i /><i /></div><div className="robot-body">S</div></div>
    <h2>One last commit.<br /><span>One saved demo.</span></h2>
    <p>Sam moved Sparky to the repair room after its battery overheated. Alex broke the build. Jordan copied your design. Three secrets. One missing robot.</p>
    <div className="hint-box">You connected the access evidence to the battery alert. Sparky is accounted for—now your team can fix the demo.</div>
    <button className="primary" onClick={onClose}>Return to the room ↗</button>
  </section>
}
