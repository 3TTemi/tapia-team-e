import { useCallback, useEffect, useState } from 'react'
import World from './world/World'
import { clues, suspects } from './game/case'
import { freshGame, loadGame, persistGame } from './game/save'
import { requestGame } from './game/dialogue'
import type { Reply, TargetId } from './game/types'
import { CaseBrief, Conversation, Ending, Notebook } from './ui/Panels'
type Panel = 'notebook' | 'ending' | null
export default function App() {
  const [game, setGame] = useState(loadGame)
  const [started, setStarted] = useState(false)
  const [locked, setLocked] = useState(false)
  const [target, setTarget] = useState<TargetId | null>(null)
  const [panel, setPanel] = useState<Panel>(null)
  const [talking, setTalking] = useState<TargetId | null>(null)
  const [replyPending, setReplyPending] = useState(false)
  const [error, setError] = useState('')
  const [tutorialStarted, setTutorialStarted] = useState(false)
  const [tutorialDone, setTutorialDone] = useState(false)
  const [discoveries, setDiscoveries] = useState<typeof clues>([])
  const discovery = discoveries[0]
  const update = (reply: Reply, announce = true) => {
    if (announce) {
      const found = clues.filter(clue => reply.game.clues.includes(clue.id) && !game.clues.includes(clue.id))
      if (found.length) setDiscoveries(previous => [...previous, ...found])
    }
    setGame(reply.game)
  }
  useEffect(() => { if (started && locked) setTutorialStarted(true) }, [started, locked])
  useEffect(() => {
    if (!tutorialStarted) return
    const timer = window.setTimeout(() => setTutorialDone(true), 10000)
    return () => window.clearTimeout(timer)
  }, [tutorialStarted])
  useEffect(() => {
    if (!discovery) return
    const timer = window.setTimeout(() => setDiscoveries(previous => previous.slice(1)), 6000)
    return () => window.clearTimeout(timer)
  }, [discovery])
  useEffect(() => { persistGame(game) }, [game])
  useEffect(() => { let cancelled = false; requestGame(game.session, 'state').then(r => { if (!cancelled) update(r, false) }).catch(() => setError('Cannot reach the case server. Start the app with npm run dev.')); return () => { cancelled = true } }, [game.session])
  const resume = useCallback(() => {
    setStarted(true); setPanel(null); setTalking(null)
    const canvas = document.querySelector('canvas')
    try { canvas?.requestPointerLock()?.catch(() => setError('Click Resume to capture the mouse.')) } catch { setError('Mouse capture unavailable. Try resuming in a browser that supports mouse capture.') }
  }, [])
  const open = useCallback((next: Panel) => { if (replyPending) return; document.exitPointerLock?.(); setTalking(null); setPanel(next) }, [replyPending])
  const talk = useCallback((id: TargetId) => {
    if (replyPending) return
    setPanel(null); setTalking(id); document.exitPointerLock?.()
  }, [replyPending])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started || e.repeat) return
      if (e.code === 'Escape' && talking) { e.preventDefault(); resume(); return }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (talking) return
      if (e.code === 'Escape' && panel) { setPanel(null); return }
      if (panel) return
      if (e.code === 'KeyE' && locked && target) talk(target)
      if (e.code === 'KeyN') open('notebook')
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [started, panel, locked, target, open, talking, talk, resume])
  const suspect = suspects.find(s => s.id === talking)
  const speech = suspect ? { id: suspect.id, text: replyPending ? 'Thinking…' : [...game.histories[suspect.id]].reverse().find(m => m.role === 'suspect')?.text ?? suspect.opening } : null
  return <main className="game-shell">
    <div className="world"><World active={started && !panel} speech={speech} target={target} onTarget={setTarget} onLock={setLocked} /></div><div className="vignette" />
    {!started && <header className="top-bar"><div className="wordmark"><span className="logo-mark">C1</span> CAPITAL ONE <span className="wordmark-divider">/</span><span className="wordmark-sub">SPECIAL INVESTIGATIONS</span></div><div className="top-status"><span className="red-dot" /> BRANCH 07 <span className="version">LOCKDOWN</span></div></header>}
    {!started ? <><div className="intro-shade" /><CaseBrief resume={resume} hasSave={game.clues.length > 0} /><div className="scene-caption"><span className="eyebrow">NEW YORK · 2089 · 2:17 AM</span><p>The vault never opened.<br /><span>So where did eighty million dollars go?</span></p></div></> : <>
      {!panel && <aside className="objective" aria-label="Case progress">
        <div className="case-title">CASE 007: GHOST VAULT</div>
        <h3>{game.decision ? 'CASE CLOSED' : game.revealed ? 'DECIDE ECHO’S FATE' : '$80M MISSING'}</h3>
        <p><span className="status-dot" aria-hidden="true" />CLUES {game.clues.length} / {clues.length}</p>
      </aside>}
      {!panel && !talking && locked && <>
        <div className={`crosshair ${target ? 'has-target' : ''}`} aria-hidden="true" />
        {target ? <div className="interaction-prompt">{replyPending ? <span>Waiting for reply…</span> : <><kbd>E</kbd><span>TALK TO <strong>{suspects.find(s => s.id === target)?.name.split(' ')[0].toUpperCase()}</strong></span></>}</div>
          : !tutorialDone && <div className="tutorial-objective">Question the suspects <span aria-hidden="true">→</span> Find 3 clues</div>}
      </>}
      {!panel && !talking && !locked && <div className="pause-overlay"><section className="pause-card"><span className="eyebrow">INVESTIGATION PAUSED</span><h2>Some secrets<br />need a little pressure.</h2><button className="primary" onClick={resume}>Resume investigation ↗</button><button className="text-button" onClick={() => open('notebook')}>Case notebook</button></section></div>}
      {!panel && <footer className="game-footer">
        <div className={`control-hints tutorial-controls ${tutorialDone || !locked ? 'tutorial-hidden' : ''}`} aria-hidden={tutorialDone || !locked}>
          <span><kbd>W A S D</kbd> Move</span><span><kbd>MOUSE</kbd> Look</span><span><kbd>ESC</kbd> Pause</span>
        </div>
        <button disabled={replyPending} className={`notebook-button ${discovery ? 'clue-pulse' : ''}`} onClick={() => open('notebook')} aria-label={`Open clues notebook, ${game.clues.length} of 3 clues`}>
          <svg className="dossier-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 8h10l3 4h13v15H3z" /><path d="M7 8V4h17v8M9 18h14M9 22h9" /></svg>
          <span>CLUES {game.clues.length}/3</span><kbd>N</kbd>
        </button>
      </footer>}
    </>}
    {suspect && <Conversation key={`${game.session}-${suspect.id}`} suspect={suspect} game={game} onUpdate={update} onBusy={setReplyPending} onClose={resume} onEnding={() => open('ending')} />}
    {panel && <div className="modal-backdrop" onKeyDown={e => {
      if (e.key === 'Tab') {
        const items = [...e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)')]
        if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1)?.focus() }
        if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0]?.focus() }
      }
    }} ref={el => { if (el && !el.contains(document.activeElement)) el.querySelector<HTMLElement>('button')?.focus() }}>
      {panel === 'notebook' && <Notebook game={game} onClose={resume} onEnding={() => setPanel('ending')} onReset={() => { setGame(freshGame()); setPanel(null); setStarted(false); setDiscoveries([]); setTutorialStarted(false); setTutorialDone(false) }} />}
      {panel === 'ending' && <Ending game={game} onUpdate={update} onClose={resume} />}
    </div>}
    {discovery && <div key={discovery.id} className="clue-discovery" role="status" aria-live="polite" aria-atomic="true">
      <span className="clue-discovery-label">CLUE FOUND</span>
      <strong>{discovery.id === 'blackout' ? '47 SECOND BLACKOUT' : discovery.title.toUpperCase()}</strong>
      <span className="clue-discovery-count">{game.clues.length} / 3 verified</span>
    </div>}
    {error && <div role="alert" className="error-toast">{error}<button aria-label="Dismiss" onClick={() => setError('')}>×</button></div>}
  </main>
}
