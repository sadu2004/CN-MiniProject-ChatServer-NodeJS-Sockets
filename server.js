// Import necessary modules
const express = require("express"); // Express framework for handling HTTP requests
const https = require("https"); // Module for creating HTTPS server
const path = require("path"); // Module for handling file paths
const fs = require("fs"); // Module for file system operations

// Initialize express application
const app = express();

// Create HTTPS server with SSL certificate and key
const server = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')), // Read SSL private key
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')), // Read SSL certificate
}, app);

// Initialize socket.io for real-time communication
const socket = require("socket.io");
const io = socket(server);

// Array to store connected users
let users = [];

// Object to store messages for different chat rooms
let messages = {
    general: [],
    random: [],
    jokes: [],
    javascript: []
};

// Event handler for new socket connection
io.on('connection', socket => {
    // Event handler for when a user joins the server
    socket.on("join server", (username) => {
        const user = {
            username,
            id: socket.id
        };
        users.push(user);
        io.emit("new user", users); // Notify all clients about the new user
    });

    // Event handler for when a user joins a room
    socket.on("join room", (roomName, cb) => {
        socket.join(roomName); // Join the specified room
        cb(messages[roomName]); // Callback with messages of the room
    });

    // Event handler for when a user creates a room
    socket.on("create room", (roomName, cb) => {
        socket.join(roomName); // Join the newly created room
        messages[roomName] = []; // Initialize empty message array for the room
        cb(messages[roomName]); // Callback with empty messages array
        io.emit("new room", roomName); // Notify all clients about the new room
    });

    // Event handler for when a user sends a message
    socket.on("send message", ({ type, content, to, sender, chatName, isChannel }) => {
        // Prepare payload for the message
        const payLoad = {
            type,
            content,
            chatName: isChannel ? chatName : sender, // Set chatName based on channel or user message
            sender
        };
        // Emit the message to the specified recipient
        socket.to(to).emit("new message", payLoad);

        // Update messages for the chat room
        if (messages[chatName]) {
            messages[chatName].push({
                type,
                sender,
                content
            });
        } else {
            messages[chatName] = [{
                type,
                sender,
                content
            }];
        }
    });

    // Event handler for when a user disconnects
    socket.on("disconnect", () => {
        users = users.filter(u => u.id !== socket.id); // Remove disconnected user from the list
        io.emit("new user", users); // Notify all clients about the updated user list
    });
});

// Start listening on port 443
server.listen(443, () => {
    console.log("Server is running on port 443.");
});
