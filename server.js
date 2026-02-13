const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = { white: null, black: null };

io.on('connection', (socket) => {
    // Berikan peran ke pemain yang baru datang
    if (!players.white) {
        players.white = socket.id;
        socket.emit('playerRole', 'w');
    } else if (!players.black) {
        players.black = socket.id;
        socket.emit('playerRole', 'b');
    } else {
        socket.emit('playerRole', 'observer');
    }

    socket.on('langkah', (data) => {
        socket.broadcast.emit('langkah', data);
    });

    socket.on('disconnect', () => {
        if (socket.id === players.white) players.white = null;
        if (socket.id === players.black) players.black = null;
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server aktif di port ${PORT}`);
});
