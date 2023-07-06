const express = require('express');
const path = require('path');

const app = express();

const server = require("http").createServer(app);

const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname + "/public")))

let onlineUsers = [];

io.on('connection', function (socket) {

    socket.on('newuser', function (username) {
        socket.broadcast.emit('update', username + '' + 'joined the conversation')
    })
    socket.on('exituser', function (username) {
        socket.broadcast.emit('update', username + '' + 'left the conversation')
    })
    socket.on('chat', function (message) {
        let sender=message.username;
        let recipientUserID = message.recipientUserID;
        let priv_message=message.text;

        io.to(recipientUserID).emit("new_private_message", {message:priv_message,sender})

        // socket.broadcast.emit('chat', message)
    })
    socket.on("typing", function (username, message) {
        socket.broadcast.emit('typing', username, message)
    })

    socket.on('login', (username) => {
        const userExists = onlineUsers.some((user) => user.username === username);
        if (!userExists) {
            onlineUsers.push({ id: socket.id, username });
        }
        socket.broadcast.emit('connectedUsers', onlineUsers);
    });


    socket.on('log-out', (username) => {
        const disconnectedUserID = socket.id;
        const disconnectedUser = username;

        if (disconnectedUser) {
            socket.broadcast.emit('userDisconnected', {
                disconnectedUser: disconnectedUser,
                disconnectedUserID: disconnectedUserID
            });
        }
    });

    // socket.on('privateMessage', (data) => {
    //     const { recipientId, message } = data;
    //     console.log(recipientId);
    //     console.log(message);
        

    //     io.to(recipientId).emit('privateMessage', { senderId: socket.id, message });
    // });


})

server.listen(5000, function () {
    console.log('listening port 5000')
});