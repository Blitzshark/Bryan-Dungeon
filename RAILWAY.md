# Railway hosting

Connect this GitHub repository and deploy `main`. `railway.json` sets the build,
start command, health check, restart policy, and one replica. The Node server
binds `0.0.0.0` on Railway's `PORT` (8080 is supported). Use the public
`https://bryan-dungeon.up.railway.app` address, not the Railway dashboard URL.

Solo, online rooms, lobby browsing, and tavern presence work on one Railway
instance without adding a database. These rooms live in the running process
and reset on redeployment or restart. Saved solo games stay in the browser.

For rooms that persist across restarts, add Railway Redis and add a service
variable `REDIS_URL` referencing that Redis service's `REDIS_URL`. Existing
Upstash REST URL/token variables also work and take priority. Never put
credentials in game URLs or browser code. Redis is required for multiple
replicas; the default configuration deliberately runs one replica.

Vercel still requires shared Redis because its functions do not share memory.

Health check: `/health`. Room readiness: `/api/rooms?status=1`.
