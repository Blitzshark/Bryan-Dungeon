// Local development server. The complete game also runs as static files on GitHub Pages or Vercel.
const express = require('express');
const path = require('node:path');
const app = express();
app.get('/health', (req, res) => res.json({ ok: true, game: 'campaign', version: 4 }));
app.get('/play', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.use(express.static(__dirname, { dotfiles: 'deny', index: 'index.html' }));
const server = app.listen(process.env.PORT || 3000, () => console.log('Bryan’s Dungeon campaign listening on ' + server.address().port));
