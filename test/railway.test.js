const {test}=require('node:test'),assert=require('node:assert/strict'),{spawn}=require('node:child_process'),{once}=require('node:events'),E=require('../campaign'),{NativeRedisStore}=require('../lib/room-store');
test('Railway production serves the game, creates discoverable rooms, joins guests and starts combat without Vercel storage',async()=>{
 const env={...process.env,NODE_ENV:'production',RAILWAY_ENVIRONMENT_ID:'test',PORT:'0'};for(const k of ['VERCEL','REDIS_URL','KV_REST_API_URL','KV_REST_API_TOKEN','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN'])delete env[k];
 const child=spawn(process.execPath,['server.js'],{cwd:require('node:path').join(__dirname,'..'),env,stdio:['ignore','pipe','pipe']});
 try{const [out]=await once(child.stdout,'data'),port=String(out).match(/listening on (\d+)/)[1],base='http://127.0.0.1:'+port;
 const call=async(body,token,query='')=>{const r=await fetch(base+'/api/rooms'+query,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});const data=await r.json();assert.equal(r.status,200,JSON.stringify(data));return data;};
 assert((await fetch(base+'/')).ok);assert((await fetch(base+'/play')).ok);assert((await (await fetch(base+'/health')).json()).ok);assert.equal((await call(null,null,'?status=1')).storage,'local-memory');
 const host=await call({op:'create',name:'Host',job:'warrior'});const guest=await call({op:'join',name:'Guest',code:host.code});assert.equal(guest.members.length,2);const list=await call(null,null,'?list=1');assert(JSON.stringify(list).includes(host.code));
 const view=await call(null,host.token,'?code='+host.code);const started=await call({op:'command',code:host.code,version:view.version,requestId:'railway-start-test',action:{type:'start'}},host.token);assert.equal(started.started,true);assert.equal(started.state.phase,'battle');assert.equal(started.state.route.regions[0].biome,'forest');
 }finally{const exited=once(child,'exit');child.kill('SIGTERM');const [code,signal]=await exited;assert.equal(code,0,'deployment stop exits successfully');assert.equal(signal,null);}
});
test('native Railway Redis keeps the shared store wire format and lock semantics',async()=>{
 const store=new NativeRedisStore('redis://localhost:6379'),values=new Map(),calls=[];store.client={isReady:true,sendCommand:async args=>{calls.push(args);assert(args.every(x=>typeof x==='string'));if(args[0]==='SET'){values.set(args[1],args[2]);return 'OK';}if(args[0]==='GET')return values.get(args[1])??null;return 1;}};
 await store.locked('ABC123',()=>store.set('ABC123',{kind:'tavern',visitors:[]}));assert.deepEqual(await store.get('ABC123'),{kind:'tavern',visitors:[]});assert(calls.some(a=>a[0]==='EVAL'));
});
test('previous random-map saves migrate to fixed sections without healing or losing current combat',()=>{
 const s=E.createRun('Tester','warrior','campaign',{seed:73});s.route.version=1;s.route.regions=s.route.regions.slice(0,6).reverse();s.route.encounters=s.route.encounters.slice(0,60);s.party[0].hp=17;s.enemies[0].hp=9;const loaded=E.restore(s);assert.equal(loaded.route.version,4);assert.deepEqual(loaded.route.regions.map(r=>r.biome),['forest','crypt','throne','reef','ship','jungle','cloud','tempest','zenith']);assert.equal(loaded.party[0].hp,17);assert.equal(loaded.enemies[0].hp,9);assert(!E.needsMigration(loaded));
});
