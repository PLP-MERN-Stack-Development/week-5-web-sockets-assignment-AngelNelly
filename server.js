const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // new part: listen for username
  socket.on('new-user', (username) => {
    socket.username = username;
    console.log('User joined:', username);
  });

  // listen for messages sent by user
  socket.on('send-message', (msgData) => {
    // broadcast to everyone else except sender
    socket.broadcast.emit('chat-message', msgData);
  });

  // listen for typing indicator
  socket.on('typing', (data) => {
    socket.broadcast.emit('user-typing', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
