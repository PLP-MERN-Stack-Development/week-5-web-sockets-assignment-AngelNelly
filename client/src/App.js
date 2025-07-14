import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // change port if different

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const name = prompt('Enter your username:');
    setUsername(name);
    socket.emit('new-user', name);

    socket.on('chat-message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('user-typing', (data) => {
      setIsTyping(data.isTyping);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() !== '') {
      const msgData = {
        sender: username,
        text: message,
        timestamp: new Date().toLocaleTimeString()
      };
      socket.emit('send-message', msgData);
      setMessages((prev) => [...prev, msgData]); // add to own chat
      setMessage('');
    }
  };

  const handleTyping = () => {
    socket.emit('typing', { isTyping: message.length > 0 });
  };

  return (
    <div>
      <h1>Welcome, {username}!</h1>
      <div style={{ border: '1px solid black', height: '200px', overflowY: 'scroll' }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}</strong>: {msg.text} <em>({msg.timestamp})</em>
          </div>
        ))}
      </div>
      {isTyping && <p>Someone is typing...</p>}
      <form onSubmit={sendMessage}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleTyping}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
