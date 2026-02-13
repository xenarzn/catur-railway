const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Folder public untuk file HTML/JS
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Menerima data langkah dan menyebarkannya ke pemain lain
    socket.on('langkah', (move) => {
        socket.broadcast.emit('langkah', move);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Railway akan otomatis mengisi process.env.PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
