// Local development server. The complete game also runs as static files on GitHub Pages or Vercel.
const express = require('express');
const path = require('node:path');
const app = express();
app.use((req,res,next)=>{if(!req.path.startsWith('/api/'))res.setHeader('Cache-Control','no-cache, max-age=0, must-revalidate');next();});
app.use('/api/rooms',express.json({limit:'16kb'}),express.text({type:'text/plain',limit:'16kb'}),require('./api/rooms'));
app.use('/api',(req,res)=>res.status(404).json({error:'Unknown API endpoint.'}));
app.get('/health', (req, res) => res.json({ ok: true, game: 'campaign', version: 5 }));
app.get('/play', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.use(express.static(__dirname, { dotfiles: 'deny', index: 'index.html' }));
const server = app.listen(process.env.PORT || 3000, () => console.log('Bryan’s Dungeon campaign listening on ' + server.address().port));
