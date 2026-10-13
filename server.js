const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const players = {};

io.on("connection", (socket) => {

    players[socket.id] = {
        id: socket.id,
        name: "Player",
        color: "#00ff66",
        x: Math.random() * 800 + 100,
        y: Math.random() * 800 + 100
    };

    io.emit("players", players);

    socket.on("playerData", (data) => {

        if (!players[socket.id]) return;

        players[socket.id].name = data.name;
        players[socket.id].color = data.color;

        io.emit("players", players);
    });

    socket.on("move", (data) => {

        if (!players[socket.id]) return;

        players[socket.id].x = data.x;
        players[socket.id].y = data.y;

        io.emit("players", players);
    });

    socket.on("disconnect", () => {

        delete players[socket.id];

        io.emit("players", players);
    });

});

app.get("/", (req, res) => {
    res.send("Dungeon server online");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Running on port " + PORT);
});
