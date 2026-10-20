'use strict';
const {createStore,RoomError}=require('../lib/room-store');
const {RoomService}=require('../lib/rooms');
const {TavernService}=require('../lib/tavern');
const {PresenceService}=require('../lib/presence');
let service,tavern,presence;
function getService(){return service||(service=new RoomService(createStore()));}
function bearer(req){return String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');}
module.exports=async function handler(req,res){
 res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');if(req.method==='OPTIONS')return res.status(204).end();
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');
 try{
  const rooms=getService();const url=new URL(req.url,'http://localhost');
  if(req.method==='GET'&&url.searchParams.has('status')){if(rooms.store.kind==='shared-redis')await rooms.store.command(['PING']);return res.status(200).json({ok:true,storage:rooms.store.kind,maxPlayers:6});}
  if(req.method==='GET'&&url.searchParams.has('list'))return res.status(200).json(await rooms.list(url.searchParams.get('mode')));
  if(req.method==='GET')return res.status(200).json(await rooms.poll(url.searchParams.get('code'),bearer(req)));
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Use GET or POST.'});}
  let input=req.body;if(typeof input==='string'){if(input.length>16384)throw new RoomError(413,'Request is too large.');try{input=JSON.parse(input);}catch{throw new RoomError(400,'Send a valid JSON request.');}}
  if(!input||typeof input!=='object'||JSON.stringify(input).length>16384)throw new RoomError(400,'Send a small JSON request.');
  const result=['presence','presenceLeave'].includes(input.op)?await (presence||(presence=new PresenceService(rooms.store))).request(input):String(input.op).startsWith('tavern')?await (tavern||(tavern=new TavernService(rooms.store))).request(input):input.op==='create'?await rooms.create(input):input.op==='join'?await rooms.join(input):input.op==='command'?await rooms.command(input,bearer(req)):input.op==='depart'?await rooms.depart(input.code,input.token):null;
  if(!result)throw new RoomError(400,'Unknown room operation.');return res.status(200).json(result);
 }catch(error){const status=error instanceof RoomError?error.status:500;return res.status(status).json({error:status===500?'The room service hit a problem. Please retry.':error.message});}
};
