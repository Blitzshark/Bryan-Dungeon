const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
test('Vercel builds the actual game homepage and all client assets into its configured static output',()=>{
 const root=path.join(__dirname,'..'),config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));assert.equal(config.framework,null);assert.equal(config.outputDirectory,'public');assert.equal(config.functions['api/rooms.js'].maxDuration,20);execFileSync(process.execPath,['scripts/build.js'],{cwd:root});const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');assert.match(html,/The Hollow Road/);assert.match(html,/id="online-game"/);assert.match(html,/id="camp-screen"/);
 for(const asset of [...html.matchAll(/(?:src|href)="([a-z-]+\.(?:js|css))(?:\?[^\"]*)?"/g)].map(m=>m[1]))assert(fs.existsSync(path.join(root,'public',asset)),asset+' must be deployed');
 assert.equal(fs.existsSync(path.join(root,'public','.env')),false);assert.equal(fs.existsSync(path.join(root,'public','lib/room-store.js')),false);
});
