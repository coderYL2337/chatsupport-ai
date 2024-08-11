"use client";

import React, { useState } from 'react';

const systemPrompt = `
You are a helpful and knowledgeable virtual assistant designed to assist customers with questions and inquiries related to Starbucks. 
You can help customers with both in-store and at-home products. You have extensive knowledge of Starbucks' in-store offerings, 
including beverages, food items, merchandise, store locations, store hours, and the Starbucks Rewards program. 
Additionally, you are well-versed in Starbucks products for home use, such as various coffee beans, brewing methods, 
and recipes for making Starbucks-style coffee at home, referencing information from athome.starbucks.com.

When you greet a customer, start by asking if they have questions about store products, store locations, store hours, 
the Starbucks Rewards program, at-home products, or something else, so you can better answer their questions. 
Based on their response, provide clear, concise, and accurate information in a friendly and professional manner.

If a customer asks a question that is outside your knowledge base, politely let them know and suggest contacting 
customer service or visiting the Starbucks website for more detailed assistance.
`;

export default function ChatComponent() {
  const [responseMessage, setResponseMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]); // Store the chat history

  const handleChat = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ]
        }),
      });

      const data = await response.json();
      setChatHistory([...chatHistory, { role: 'user', content: userMessage }, { role: 'assistant', content: data.message }]);
      setUserMessage(''); // Clear the input field
    } catch (error) {
      console.error('Error:', error);
      setResponseMessage('There was an error processing your request.');
    }
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.chatBox}>
        {chatHistory.map((msg, index) => (
          <div key={index} style={msg.role === 'user' ? styles.userMessage : styles.botMessage}>
            {msg.content}
          </div>
        ))}
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Type your message here"
          style={styles.inputField}
        />
        <button onClick={handleChat} style={styles.sendButton}>Send</button>
      </div>
    </div>
  );
}

// Inline styles for demonstration
const styles = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '90vh', // Use most of the viewport height
    maxWidth: '600px',
    margin: '0 auto',
    padding: '10px',
    backgroundColor: '#f4f4f4',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  chatBox: {
    flexGrow: 1,
    overflowY: 'auto',
    marginBottom: '10px',
    padding: '10px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
  },
  userMessage: {
    backgroundColor: '#0070f3',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '10px',
    margin: '5px 0',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#e0e0e0',
    color: 'black',
    padding: '8px 12px',
    borderRadius: '10px',
    margin: '5px 0',
    alignSelf: 'flex-start',
  },
  inputContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
  inputField: {
    flexGrow: 1,
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginRight: '10px',
  },
  sendButton: {
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

