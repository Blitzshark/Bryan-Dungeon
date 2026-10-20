// Legacy combat fixtures model an authenticated Bryan account explicitly.
// Account/permission tests import the real engine and test untrusted names separately.
const Engine=require('../campaign');
const BRYAN_ACCOUNT={id:'fixture-bryan-account',username:'Bryan',isAdmin:true,adminEnabled:true};
module.exports={...Engine,BRYAN_ACCOUNT,createRun:(name,job,mode,options={})=>Engine.createRun(name,job,mode,{adminAllowed:String(name).trim().toLowerCase()==='bryan',...options})};
