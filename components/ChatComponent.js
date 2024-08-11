"use client";

import React, { useState } from 'react';

export default function ChatComponent() {
  const [responseMessage, setResponseMessage] = useState('');

  const handleChat = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'Hi there!' }
          ]
        }),
      });

      const data = await response.json();
      setResponseMessage(data.message);  // Assuming the API returns { message: "..." }
    } catch (error) {
      console.error('Error:', error);
      setResponseMessage('There was an error processing your request.');
    }
  };

  return (
    <div>
      <button onClick={handleChat}>Send Message</button>
      <p>Response: {responseMessage}</p>
    </div>
  );
}
