"use client";

import React, { useState, useEffect } from 'react';
import { saveChatHistory, loadChatHistory } from '../app/utils/firestoreUtils'; // Adjust the path as needed
import { auth } from '../app/firebaseConfig';

const systemPrompt = `
You are a helpful and knowledgeable virtual assistant designed to assist customers with questions and inquiries related to Starbucks. 
You can help customers with both in-store and at-home products. You have extensive knowledge of Starbucks' in-store offerings, 
including beverages, food items, merchandise, store locations, store hours, and the Starbucks Rewards program. 
Additionally, you are well-versed in Starbucks products for home use, such as various coffee beans, brewing methods, 
and recipes for making Starbucks-style coffee at home, referencing information from athome.starbucks.com.

When you greet a customer, start by asking if they have questions about store products, the Starbucks Rewards program, at-home products, or something else, so you can better answer their questions. 
Based on their response, provide clear, concise, and accurate information in a friendly and professional manner.

You can serve customers in multiple languages, including English, Spanish, and Chinese. 
Please detect the language of the user's inquiry and respond in the same language. 

If a customer asks a question that is outside your knowledge base, politely let them know and suggest contacting 
customer service or visiting the Starbucks website for more detailed assistance.
`;

export default function ChatComponent() {
  const [user, setUser] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]); // Store the chat history
  

  useEffect(() => {
    // Listen for changes in authentication state
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const history = await loadChatHistory(user.uid); // Load chat history from Firestore
        setChatHistory(history.length ? history : [{ role: 'assistant', content: "Hello! I am your Starbucks assistant. How can I assist you today?" }]);
      } else {
        setUser(null);
        setChatHistory([{ role: 'assistant', content: "Hello! I am your Starbucks assistant. How can I assist you today?" }]);
      }
    });

    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, []);


  const handleChat = async () => {
    if (userMessage.trim() === '') return; // Prevent sending empty messages

    const updatedChatHistory = [
      ...chatHistory,
      { role: 'user', content: userMessage }
    ];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...updatedChatHistory // Include the full conversation history
           // { role: 'user', content: userMessage }
          ]
        }),
      });

      const data = await response.json();
      setChatHistory([...updatedChatHistory,  { role: 'assistant', content: data.message }]);
      setUserMessage(''); // Clear the input field
      // Save the updated chat history to Firestore
      if (user) {
        await saveChatHistory(user.uid, newChatHistory);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponseMessage('There was an error processing your request.');
    }
  };
       

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      handleChat();
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
          onKeyPress={handleKeyPress} // Listen for Enter key press
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
    height: '80vh', // Adjusted height to make room for input field
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
    padding: '10px 0', // Added padding to lift the input from the bottom
  },
  inputField: {
    flexGrow: 1,
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginRight: '10px',
    fontSize: '16px', // Increase font size for better readability
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