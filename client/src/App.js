import React, { useState, useRef, useEffect } from 'react';
import Form from "./components/UsernameForm";
import Chat from "./components/Chat";
import Image from './components/Image';
import io from "socket.io-client";
import { produce, setAutoFreeze } from "immer";
import './App.css';

// Initial state for messages, organized by chat room
const initialMessagesState = {
  general: [],
  random: [],
  jokes: [],
  javascript: []
};

// Initial list of available rooms
var initialRoom = [
  "general",
  "random",
  "jokes",
  "javascript"
];

function App() {
  // State variables
  const [username, setUsername] = useState(""); // Username of the connected user
  const [connected, setConnected] = useState(false); // Whether the user is connected to the server
  const [currentChat, setCurrentChat] = useState({ isChannel: true, chatName: "general", recieverId: "" }); // Currently selected chat room
  const [connectedRooms, setConnectedRooms] = useState(["general"]); // Rooms the user has joined
  const [allUsers, setAllUsers] = useState([]); // List of all connected users
  const [messages, setMessages] = useState(initialMessagesState); // Messages for each chat room
  const [message, setMessage] = useState(""); // Current message being typed
  const [rooms, setRooms] = useState(initialRoom); // List of all available rooms
  const [file, setFile] = useState(); // Selected file for upload
  const socketRef = useRef(); // Reference to the socket.io connection

  // Function to handle changes in the message input field
  function handleMessageChange(e) {
    setMessage(e.target.value);
  }

  // Update the list of all users whenever it changes
  useEffect(() => {
    setAllUsers(allUsers);
  }, [allUsers]);

  // Clear the message input field whenever messages are updated
  useEffect(() => {
    setMessage("");
  }, [messages]);

  // Function to send a message
  function sendMessage() {
    // Check if a file is selected
    if (file) {
      // Create a payload object for file messages
      const payLoad = {
        type: "file",
        content: file,
        to: currentChat.isChannel ? currentChat.chatName : currentChat.recieverId,
        sender: username,
        chatName: currentChat.chatName,
        isChannel: currentChat.isChannel,
        mimeType: file.type,
        fileName: file.name
      };
      // Clear message and file state
      setMessage("");
      setFile();
      // Emit the message to the server
      socketRef.current.emit("send message", payLoad);
      // Update the messages state with the new message
      const newMessages = produce(messages, draft => {
        draft[currentChat.chatName].push({
          type: "file",
          sender: username,
          content: file
        });
      });
      setMessages(newMessages);
    } else {
      // Create a payload object for text messages
      const payLoad = {
        type: "text",
        content: message,
        to: currentChat.isChannel ? currentChat.chatName : currentChat.recieverId,
        sender: username,
        chatName: currentChat.chatName,
        isChannel: currentChat.isChannel
      };
      // Emit the message to the server
      socketRef.current.emit("send message", payLoad);
      // Update the messages state with the new message
      const newMessages = produce(messages, draft => {
        draft[currentChat.chatName].push({
          type: "text",
          sender: username,
          content: message
        });
      });
      setMessages(newMessages);
      // Clear the message input field
      setMessage("");
    }
  }

  // Function to handle file selection
  function selectFile(e) {
    setFile(e.target.files[0]);
  }

  // Callback function for joining a room
  function roomJoinCallback(incomingMessages, room, exists) {
    // Update the messages state with the received messages
    const newMessages = produce(messages, draft => {
      draft[room] = exists ? incomingMessages : [];
    });
    setMessages(newMessages);
  }

  // Function to create a new chat room
  function createRoom() {
    const room = prompt("Enter the name of the new room:");
    // Update the list of connected rooms
    const newConnectedRooms = produce(connectedRooms, draft => {
      draft.push(room);
    });
    // Emit the create room event to the server
    socketRef.current.emit("create room", room, (messages) => roomJoinCallback(messages, room, 0));
    setConnectedRooms(newConnectedRooms);
    // Switch to the newly created room
    const currentChat = {
      chatName: room,
      isChannel: true,
      receiverId: ''
    };
    toggleChat(currentChat);
  }

  // Function to join an existing chat room
  function joinRoom(room) {
    // Update the list of connected rooms
    const newConnectedRooms = produce(connectedRooms, draft => {
      draft.push(room);
    });
    // Emit the join room event to the server
    socketRef.current.emit("join room", room, (messages) => roomJoinCallback(messages, room, 1));
    setConnectedRooms(newConnectedRooms);
  }

  // Function to switch between chat rooms
  function toggleChat(currentChat) {
    // Initialize the messages for the selected room if it doesn't exist
    if (!messages[currentChat.chatName]) {
      const newMessages = produce(messages, draft => {
        draft[currentChat.chatName] = [];
      });
      setMessages(newMessages);
    }
    setCurrentChat(currentChat);
  }

  // Function to handle changes in the username input field
  function handleChange(e) {
    setUsername(e.target.value);
  }

  // Function to connect to the server
  function connect() {
    setConnected(true);
    // Connect to the socket.io server
    socketRef.current = io.connect('/');
    // Emit the join server event with the username
    socketRef.current.emit('join server', username);
    // Join the general room by default
    socketRef.current.emit('join room', 'general', (messages) => roomJoinCallback(messages, 'general', 1));
    // Listen for new user events and update the list of all users
    socketRef.current.on('new user', allUsers => {
      setAllUsers(allUsers);
    });
    // Listen for new room events and update the list of available rooms
    socketRef.current.on('new room', roomName => {
      setRooms(rooms => {
        const newRooms = produce(rooms, draft => {
          draft.push(roomName);
        });
        return newRooms;
      });
    });
    // Listen for new message events and update the messages state
    socketRef.current.on('new message', ({ type, content, sender, chatName }) => {
      setMessages(messages => {
        const newMessages = produce(messages, draft => {
          if (draft[chatName]) {
            draft[chatName].push({ type, content, sender });
          } else {
            draft[chatName] = [{ type, content, sender }];
          }
        });
        return newMessages;
      });
    });
  }

  // Conditionally render the chat interface or the username form
  let body;
  if (connected) {
    body = (
      <Chat
        message={message}
        handleMessageChange={handleMessageChange}
        sendMessage={sendMessage}
        yourId={socketRef.current ? socketRef.current.id : ""}
        allUsers={allUsers}
        joinRoom={joinRoom}
        connectedRooms={connectedRooms}
        currentChat={currentChat}
        toggleChat={toggleChat}
        messages={messages[currentChat.chatName]}
        createRoom={createRoom}
        rooms={rooms}
        selectFile={selectFile}
        Image={Image}
      />
    );
  } else {
    body = (
      <Form username={username} onChange={handleChange} connect={connect} />
    );
  }

  return (
    <div className="App">
      {body}
    </div>
  );
}

export default App;