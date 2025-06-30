const express = require('express');
const path = require('path');
const http = require('http');
const socket = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket(server, {
    cors: {
        origin: '*', // możesz ograniczyć do 'http://localhost:3000' dla bezpieczeństwa
    },
});

const tasks = []; // Lista zadań

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Wyślij aktualną listę zadań tylko do nowego klienta
    socket.emit('updateData', tasks);

    // Obsługa dodawania zadania
    socket.on('addTask', (task) => {
        tasks.push(task);
        socket.broadcast.emit('addTask', task); // Emituj do wszystkich oprócz siebie
    });

    // Obsługa usuwania zadania
    socket.on('removeTask', (id) => {
        const index = tasks.findIndex((task) => task.id === id);
        if (index !== -1) {
            tasks.splice(index, 1);
            socket.broadcast.emit('removeTask', id); // Emituj do innych
        }
    });
});

app.use(express.static(path.join(__dirname, '/client/build')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

server.listen(8000, () => {
    console.log('Server is running on port 8000');
});
