const socket = io("https://bryan-dungeon-game.onrender.com");

const world = document.getElementById("world");
const count = document.getElementById("count");
const nameBox = document.getElementById("nameBox");
const colorBox = document.getElementById("colorBox");

let myId = null;

const playerElements = {};

const localPlayer = {
    x: 500,
    y: 500
};

const keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

socket.on("connect", () => {

    myId = socket.id;

    socket.emit("playerData", {
        name: nameBox.value,
        color: colorBox.value
    });

});

nameBox.addEventListener("input", () => {

    socket.emit("playerData", {
        name: nameBox.value,
        color: colorBox.value
    });

});

colorBox.addEventListener("input", () => {

    socket.emit("playerData", {
        name: nameBox.value,
        color: colorBox.value
    });

});

socket.on("players", (players) => {

    count.textContent =
        "Players Online: " +
        Object.keys(players).length;

    for (const id in players) {

        if (!playerElements[id]) {

            const player =
                document.createElement("div");

            player.className = "player";

            const name =
                document.createElement("div");

            name.className = "playerName";

            player.appendChild(name);

            world.appendChild(player);

            playerElements[id] = {
                player,
                name
            };
        }

        playerElements[id].player.style.left =
            players[id].x + "px";

        playerElements[id].player.style.top =
            players[id].y + "px";

        playerElements[id].player.style.background =
            players[id].color;

        playerElements[id].name.textContent =
            players[id].name;
    }

    for (const id in playerElements) {

        if (!players[id]) {

            playerElements[id].player.remove();

            delete playerElements[id];
        }
    }

});

function update() {

    let dx = 0;
    let dy = 0;

    if (keys["w"]) dy--;
    if (keys["s"]) dy++;
    if (keys["a"]) dx--;
    if (keys["d"]) dx++;

    if (dx !== 0 || dy !== 0) {

        const len = Math.hypot(dx, dy);

        dx /= len;
        dy /= len;

        localPlayer.x += dx * 5;
        localPlayer.y += dy * 5;

        socket.emit("move", {
            x: localPlayer.x,
            y: localPlayer.y
        });
    }

    world.style.left =
        (-localPlayer.x + window.innerWidth / 2) +
        "px";

    world.style.top =
        (-localPlayer.y + window.innerHeight / 2) +
        "px";

    requestAnimationFrame(update);
}

update();
