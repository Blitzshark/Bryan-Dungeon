const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),out=path.join(root,'public');
fs.mkdirSync(out,{recursive:true});
for(const name of ['index.html','styles.css','campaign.js','scene.js','sound.js','multiplayer.js','game.js'])fs.copyFileSync(path.join(root,name),path.join(out,name));
console.log('Built standalone game into public/. Vercel serves /api/rooms separately.');
