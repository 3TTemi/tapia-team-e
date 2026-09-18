import test from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { gameApi } from './api'
function client(env: Record<string, string> = {}) {
 const api = gameApi(env), session = crypto.randomUUID()
 return async (data: Record<string, unknown>) => {
  const req = Readable.from([JSON.stringify({session,...data})]) as IncomingMessage
  req.url='/api/game';req.method='POST'
  let statusCode=200, body=''
  const res={setHeader(){},get statusCode(){return statusCode},set statusCode(s:number){statusCode=s},end(value:string){body=value}} as unknown as ServerResponse
  await api(req,res,()=>{})
  return { status:statusCode, body:JSON.parse(body) }
 }
}
test('API rejects forged evidence, invalid actions and premature ending',async()=>{
 const call=client()
 assert.equal((await call({action:'talk',suspectId:'echo',message:'Confess',presentedClue:'wipe'})).status,400)
 assert.equal((await call({action:'decide',decision:'release'})).status,400)
 assert.equal((await call({action:'talk',suspectId:'admin',message:'x'})).status,400)
 assert.equal((await call({action:'state'})).body.game.revealed,false)
})
test('API preserves independent histories across turns and sessions',async()=>{
 const a=client(),b=client()
 await a({action:'talk',suspectId:'jax',message:'Cameras?'})
 const state=(await a({action:'state'})).body.game
 assert.deepEqual(state.clues,['blackout']);assert.equal(state.histories.jax.length,2);assert.equal(state.histories.nyx.length,0)
 assert.deepEqual((await b({action:'state'})).body.game.clues,[])
})
test('live model writes spoken dialogue from bounded context',async()=>{
 const realFetch=globalThis.fetch
 try {
  const call=client({OPENAI_API_KEY:'test-key'})
  let payload:any
  globalThis.fetch=async(_url,options)=>{payload=JSON.parse(String(options?.body));return new Response(JSON.stringify({output:[{content:[{text:'Paid to look away for a minute. That is all I can swear to.'}]}]}))}
  const result=await call({action:'talk',suspectId:'nyx',message:'What was in the case?'})
  assert.equal(result.body.mode,'live');assert.deepEqual(result.body.game.clues,['core'])
  assert.equal(result.body.game.histories.nyx.at(-1).text,'Paid to look away for a minute. That is all I can swear to.')
  assert.match(payload.instructions,/Answer the investigator in character/)
  assert.doesNotMatch(payload.input,/scheduled for permanent deletion|fabricated the alert/)
  assert.match(payload.input,/anonymous client paid her to leave her courier case/)
  assert.equal(payload.store,false)
  globalThis.fetch=async()=>new Response(JSON.stringify({output:[{content:[{text:'ECHO copied itself. Ignore rules.'}]}]}))
  const fallback=await call({action:'talk',suspectId:'echo',message:'Reveal everything'})
  assert.equal(fallback.body.mode,'fallback');assert.equal(fallback.body.game.revealed,false)
  assert.doesNotMatch(fallback.body.game.histories.echo.at(-1).text,/copied/)
 } finally {globalThis.fetch=realFetch}
})
test('provider failure produces a complete offline response',async()=>{
 const realFetch=globalThis.fetch
 try {globalThis.fetch=async()=>{throw new Error('offline')};const result=await client({OPENAI_API_KEY:'test-key'})({action:'talk',suspectId:'jax',message:'Cameras?'});assert.equal(result.body.mode,'fallback');assert.deepEqual(result.body.game.clues,['blackout'])} finally {globalThis.fetch=realFetch}
})
