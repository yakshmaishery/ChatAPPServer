const express = require('express'); // Import Express
const http = require('http'); // Import HTTP module
const { Server } = require('socket.io'); // Import Socket.IO

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
app.get('/', (req, res) => {
    res.send('Socket.IO server is running!');
});

// Listen for connection events
io.on('connection', (socket) => {
   //  console.log('A user connected:', socket.id);

    // Listen for custom events from the client
   //  socket.on('message', (data) => {
   //      console.log('Message received:', data);

   //      // Emit a response back to the client
   //      socket.emit('response', 'Message received: ' + data);
   //  });
   //  socket.on("LoginID",(data) => {
   //    let checker = LoginIDList.some((e)=>{return e.LoginID == data.LoginID})
   //    if(!checker){
   //       LoginIDList.push({LoginID:data.LoginID,ID:data.ID})
   //    }
   //    socket.emit("LoginIDresponse",!checker)
   //  })

    socket.on("SendMessage",(data) => {
      let Data = {
         senderID:data.ID,
         senderEmail:data.EmailID,
         senderMessage:data.Msg,
      }
      socket.broadcast.emit("recivedMessage",Data)
    })
    socket.on("UserloggedIn",(data) => {
      users[socket.id] = data;
      socket.broadcast.emit("UserloggedInNotice",data)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      //   console.log('User disconnected:', socket.id);
      //   const index = LoginIDList.findIndex(prop => prop.ID === socket.id)
      //   LoginIDList.splice(index,1)
      const username = users[socket.id];
      // Remove the user from the list
      delete users[socket.id];
      socket.broadcast.emit("disconnectUser",username)
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
