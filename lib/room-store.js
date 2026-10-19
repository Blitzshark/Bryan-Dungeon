'use strict';
const crypto=require('node:crypto');
class RoomError extends Error{constructor(status,message){super(message);this.status=status;}}
class MemoryStore{
 constructor(){this.rooms=new Map();this.queues=new Map();this.kind='local-memory';}
 async get(code){const value=this.rooms.get(code);if(!value||value.expires<Date.now()){this.rooms.delete(code);return null;}return structuredClone(value.data);}
 async set(code,data){this.rooms.set(code,{data:structuredClone(data),expires:Date.now()+86400000});}
 async delete(code){this.rooms.delete(code);}
 async list(){const values=await Promise.all([...this.rooms.keys()].map(code=>this.get(code)));return values.filter(Boolean);}
 async locked(code,work){const previous=this.queues.get(code)||Promise.resolve();let release;const gate=new Promise(resolve=>release=resolve);this.queues.set(code,gate);await previous;try{return await work();}finally{release();if(this.queues.get(code)===gate)this.queues.delete(code);}}
}
class RedisStore{
 constructor(url,token){if(!url.startsWith('https://'))throw new RoomError(503,'Redis must use a secure HTTPS REST endpoint.');this.url=url.replace(/\/$/,'');this.token=token;this.kind='shared-redis';}
 async command(args){let response;try{response=await fetch(this.url,{method:'POST',headers:{Authorization:'Bearer '+this.token,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(7000)});}catch{throw new RoomError(503,'The room database is temporarily unreachable. Try again shortly.');}if(!response.ok)throw new RoomError(503,'The room database connection needs attention in Vercel Storage.');const json=await response.json();if(json.error)throw new RoomError(503,'The room database could not complete this request.');return json.result;}
 key(code){return 'hollow-road:v5:room:'+code;}
 async get(code){const raw=await this.command(['GET',this.key(code)]);return raw?JSON.parse(raw):null;}
 async set(code,data){await this.command(['SET',this.key(code),JSON.stringify(data),'EX',86400]);await this.command(['ZADD','hollow-road:v5:directory',Date.now(),code]);}
 async delete(code){await this.command(['DEL',this.key(code)]);await this.command(['ZREM','hollow-road:v5:directory',code]);}
 async list(){const index='hollow-road:v5:directory';await this.command(['ZREMRANGEBYSCORE',index,'-inf',Date.now()-86400000]);const codes=await this.command(['ZREVRANGEBYSCORE',index,'+inf',Date.now()-45000,'LIMIT',0,100]);if(!codes?.length)return [];const values=await this.command(['MGET',...codes.map(code=>this.key(code))]);return values.filter(Boolean).map(raw=>JSON.parse(raw));}
 async locked(code,work){const key=this.key(code)+':lock',token=crypto.randomUUID();const acquired=await this.command(['SET',key,token,'NX','PX',30000]);if(acquired!=='OK')throw new RoomError(409,'The party is syncing. Please try that action again.');try{return await work();}finally{await this.command(['EVAL',"if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end",1,key,token]).catch(()=>{});}}
}
function createStore(env=process.env){const url=env.KV_REST_API_URL||env.UPSTASH_REDIS_REST_URL,token=env.KV_REST_API_TOKEN||env.UPSTASH_REDIS_REST_TOKEN;if(url&&token)return new RedisStore(url,token);if(env.VERCEL||env.NODE_ENV==='production')throw new RoomError(503,'Online rooms need shared storage. In Vercel, connect an Upstash Redis database under Storage, then redeploy. Solo mode works without it.');return new MemoryStore();}
module.exports={RoomError,MemoryStore,RedisStore,createStore};
