const express = require('express'); // Import Express
const http = require('http'); // Import HTTP module
const { Server } = require('socket.io'); // Import Socket.IO
const path = require('path');

const app = express(); // Create an Express app
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server,{
   cors: {
      origin: '*',
      methods: ['GET', 'POST'],
  },
}); // Attach Socket.IO to the server
const cors = require('cors');

// Enable CORS
app.use(cors({
   origin: '*', // Replace with your client URL
   methods: ['GET', 'POST'],
   credentials: true,
}));

// Store connected users
let users = {};

// Serve a basic route
// app.get('/', (req, res) => {
//     res.send('Socket.IO server is running!');
// });
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/Index.html'));
});

// Listen for connection events
io.on('connection', (socket) => {
    // console.log('A user connected:', socket.id);

     // Listen for the joinRoom event with a random key
    socket.on('joinRoom', ({joinGroupID,CurrentLoginID}) => {
      const roomExists = io.sockets.adapter.rooms.has(joinGroupID);
      socket.join(joinGroupID);

      // Notify others in the room
      if(roomExists){
        io.to(joinGroupID).emit('joinRoomMessage', {msg:`User ${CurrentLoginID} joined existing room: ${joinGroupID}`,key:joinGroupID});
      }
      else{
        socket.emit('joinRoomMessage', {msg:`User created and joined new room: ${joinGroupID}`,key:joinGroupID});
      }
    });

    // Listen for 'sendMessage' events
    socket.on('sendMessage', ({ CurrentLoginID,currentGroupID, message }) => {
      // Broadcast the message to everyone in the room
      io.to(currentGroupID).emit('message', {CurrentLoginID:CurrentLoginID,message:message});
    });

    // Leave a room
    socket.on('leaveRoom', ({CurrentLoginID,currentGroupID}) => {
      socket.leave(currentGroupID);
      let message = `User ${CurrentLoginID} left room: ${currentGroupID}`
      socket.emit('leaveRoomMessage', {CurrentLoginID:CurrentLoginID,message:message});
      socket.to(currentGroupID).emit("leaveRoomMessageToAll",{CurrentLoginID:CurrentLoginID,message:message})
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      // const username = users[socket.id];
      // socket.broadcast.emit("disconnectUser",username)
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running...`);
});
