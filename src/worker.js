const J=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});

// The table is created automatically on first use, so no manual SQL is needed.
let ready;
const init=env=>ready||(ready=env.DB.batch([
  env.DB.prepare('CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, name TEXT NOT NULL, best INTEGER NOT NULL DEFAULT 0, plays INTEGER NOT NULL DEFAULT 0, updated INTEGER NOT NULL)'),
  env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_players_best ON players(best DESC)')
]).catch(e=>{ready=null;throw e}));

export default{async fetch(req,env){
  const u=new URL(req.url);
  if(u.pathname.startsWith('/api/')){
    try{await init(env)}catch(e){return J({error:'database not ready'},500)}
  }
  if(u.pathname==='/api/leaderboard')return board(env,u.searchParams.get('id'));
  if(u.pathname==='/api/score'&&req.method==='POST')return save(req,env);
  if(u.pathname.startsWith('/api/'))return J({error:'not found'},404);
  return env.ASSETS.fetch(req);
}};

async function board(env,id){
  const top=(await env.DB.prepare('SELECT name,best FROM players ORDER BY best DESC,updated ASC LIMIT 10').all()).results;
  let me=null;
  if(id){
    const p=await env.DB.prepare('SELECT best FROM players WHERE id=?').bind(String(id).slice(0,64)).first();
    if(p){const r=await env.DB.prepare('SELECT COUNT(*)+1 AS r FROM players WHERE best>?').bind(p.best).first();me={best:p.best,rank:r.r}}
  }
  return J({top,me});
}

// One row per player: only their best score is kept.
async function save(req,env){
  let b;try{b=await req.json()}catch{return J({error:'bad json'},400)}
  const id=String(b.id||'').slice(0,64),
        name=String(b.name||'').replace(/[<>]/g,'').trim().slice(0,16),
        score=Math.floor(+b.score),time=+b.time;
  // Basic sanity check: score must be plausible for the time played.
  if(!id||!name||!(score>=0)||!(time>0)||score>time*400+300)return J({error:'invalid'},400);
  await env.DB.prepare(
    'INSERT INTO players(id,name,best,plays,updated) VALUES(?1,?2,?3,1,?4) '+
    'ON CONFLICT(id) DO UPDATE SET name=?2,best=MAX(best,?3),plays=plays+1,'+
    'updated=CASE WHEN ?3>best THEN ?4 ELSE updated END'
  ).bind(id,name,score,Date.now()).run();
  return board(env,id);
}
