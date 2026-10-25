// Persistent Node server for Railway and local development. The complete game also runs as static files on GitHub Pages or Vercel.
const express = require('express');
const path = require('node:path');
const app = express();
let shuttingDown = false;
app.use((req,res,next)=>{if(!req.path.startsWith('/api/'))res.setHeader('Cache-Control','no-cache, max-age=0, must-revalidate');next();});
app.use('/api/account',express.json({limit:'4kb'}),express.urlencoded({extended:false,limit:'4kb'}),require('./api/account'));
app.use('/api/social',express.json({limit:'12kb'}),require('./api/social'));
app.use('/api/rooms',express.json({limit:'16kb'}),express.text({type:'text/plain',limit:'16kb'}),require('./api/rooms'));
app.use('/api',(req,res)=>res.status(404).json({error:'Unknown API endpoint.'}));
app.get('/health', (req, res) => {res.setHeader('Cache-Control','no-store');res.status(shuttingDown?503:200).json({ok:!shuttingDown,game:'campaign',version:5});});
app.get('/play', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.use(express.static(__dirname, { dotfiles: 'deny', index: 'index.html' }));
const server = app.listen(process.env.PORT || 8080, '0.0.0.0', () => console.log('Bryan’s Basement campaign listening on ' + server.address().port));

// Railway sends SIGTERM when replacing or stopping a deployment. Finish active
// requests (including account writes) before exiting; idle keep-alives can close.
function shutdown(signal) {
 if (shuttingDown) return;
 shuttingDown = true;
 console.log('Received ' + signal + '; finishing active requests.');
 const deadline = setTimeout(() => {
  console.error('Shutdown timed out after 8 seconds. Closing remaining connections.');
  server.closeAllConnections?.();
  process.exit(1);
 }, 8000);
 deadline.unref();
 server.close(error => {
  clearTimeout(deadline);
  if (error) { console.error('Server shutdown failed:', error); process.exit(1); }
  console.log('Server stopped cleanly.');
  process.exit(0);
 });
 server.closeIdleConnections?.();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
