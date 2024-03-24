// Import necessary modules and components
import React from 'react';
import styled from 'styled-components';

// Styled components for styling the chat interface
const Container = styled.div`
    height: 100vh;
    width: 100%;
    display: flex;
`;

const SideBar = styled.div`
    height: 100%;
    width: 15%;
    border-right: 1px solid black;
`;

const ChatPanel = styled.div`
    height: 100;
    width: 85%;
    display: flex;
    flex-direction: column;
`;

const BodyContainer = styled.div`
    width: 100%;
    height: 75%;
    overflow: scroll;
    border-bottom: 1px solid black;
`;

const TextBox = styled.textarea`
    height: 15%;
    width: 100%;
`;

const ChannelInfo = styled.div`
    height: 10%;
    width: 100%;
    border-bottom: 1px solid black;
`;

const Row = styled.div`
    cursor: pointer;
`;

const Messages = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

// Chat component
function Chat(props){
    // Function to render the list of available rooms
    function renderRooms(room) {
        const currentChat = {
            chatName: room, 
            isChannel: true, 
            receiverId: '',
        };
        return (
            <Row onClick={() => props.toggleChat(currentChat)} key={room}>
                {room}
            </Row>
        );
    }

    // Function to render the 'Create Room' button
    function createRoomButton(){
        return(
            <div>
                <button onClick={() => props.createRoom()}>Create Room</button>
            </div>
        );
    }

    // Function to render messages
    function renderMessages(message, index){
        if (message.type === "file") {
            const blob = new Blob([message.content],{type: message.type});
            return(
                <div key={index}>
                    <h3>{message.sender}</h3>
                    <props.Image blob={blob} />
                </div>
            );
        }
        return (
            <div key={index}>
                <h3>{message.sender}</h3>
                <p>{message.content}</p>
            </div>
        );
    }

    // Function to render users
    function renderUser(user) {
        if (user.id === props.yourId) {
            return (
                <Row key={user.id}>
                    You: {user.username}
                </Row>
            );
        } 

        const currentChat = {
            chatName: user.username, 
            isChannel: false, 
            receiverId: user.id
        };

        return (
            <Row onClick={() => props.toggleChat(currentChat)} key={user.id}>
                {user.username}
            </Row>
        );
    }

    // Variable to render different components based on the current chat state
    let body; 
    if (!props.currentChat.isChannel || props.connectedRooms.includes(props.currentChat.chatName)) {
        body = (
            <Messages>
                {props.messages.map(renderMessages)}
            </Messages>
        );
    } else {
        body = (
            <button onClick={() => props.joinRoom(props.currentChat.chatName)} >Join {props.currentChat.chatName}</button>
        );
    }

    // Function to handle key down event
    function handleKeyDown(e){
        if (e.code === "Enter") {
            e.preventDefault();
            props.sendMessage();
        }
    }

    // Render the chat interface
    return(
        <Container>
            <SideBar>
                <h3>Channels</h3>
                {props.rooms.map(renderRooms)}
                {createRoomButton()}
                <h3>All Users</h3>
                {props.allUsers.map(renderUser)}
            </SideBar>
            <ChatPanel>
                <ChannelInfo>
                    {props.currentChat.chatName}
                </ChannelInfo>
                <BodyContainer>
                    {body}
                </BodyContainer>
                <TextBox
                    value={props.message}
                    onChange={props.handleMessageChange}
                    onKeyDown={handleKeyDown}
                    placeholder="say something I'm giving up on you ..."
                />
                <input onChange={props.selectFile} type="file" />
            </ChatPanel>
        </Container>
    );
};

// Export the Chat component
export default Chat;
