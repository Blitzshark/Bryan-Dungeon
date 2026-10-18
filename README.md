# Bryan’s Dungeon: The Hollow Road

A complete standalone, turn-based campaign RPG inspired by block-world party
battlers. Three controllable adventurers face eight encounters across a forest,
an underground keep, and the Hollow King’s throne. Story choices unlock a new
class or improve the party. Includes items, focus, guarding, cooldowns, leveling,
retry, camp supply purchases, optional synthesized sound, and automatic local saves.

## Play and host

Publish this repository through GitHub Pages or serve its static files on Vercel.
`index.html` is the entry point. No API, account, build step, or multiplayer server
is required. The game works without contacting Render or Socket.IO. System fonts are used, so the game has no external runtime dependencies. Saves stay in this browser on
this origin. The previous free-roam game has been replaced, and old saves are not
imported. This is a solo campaign; online multiplayer is not included.

For local development with Node.js 22+:

```sh
npm install --package-lock=false
npm start
npm test
```

Open the local server’s root or `/play` (default port 3000, configurable with
`PORT`). To develop without npm, any static HTTP server also works.

## Rules

Each living fighter gets exactly one action per round, in speed order. Party
turns wait indefinitely for the player. Enemies act automatically, individually.
No free movement, continuous combat, attack timers, or network authority exists.
Strike is free; class techniques cost focus and have cooldowns measured in the
acting character’s turns. Focus restores 3 focus and guards against half of all
incoming damage until that character’s next turn. Tonics heal 40; embers revive a
fallen ally at half health. Using an item consumes a turn. Victory grants gold,
XP, one tonic, and partial healing. Party levels increase every two encounters.
Defeat can be retried without losing previous campaign progress.

Use the enemy cards or click an enemy to choose a target. Fight / Items / Focus
and every action support mouse and touch. Keyboard: 1–3 change tabs; Q strikes;
W uses the active character’s technique; E mends with Mira; arrows change target;
Escape opens the menu. Progress saves after each resolved action. Returning to
the title lets you continue the campaign later.

## Files

- `campaign.js`: deterministic campaign and combat engine, usable in Node tests.
- `scene.js`: dependency-free Canvas block-world rendering and battle effects.
- `game.js`: menus, combat presentation, save handling, and sound.
- `styles.css`: responsive interface.
- `server.js`: optional local static development server.

Deploy the updated static files to publish this rebuild. Local changes alone do
not update an existing GitHub Pages or Vercel deployment.
