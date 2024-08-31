// "use client";

// import React, { useState, useEffect } from 'react';
// import { saveChatHistory, loadChatHistory } from '../app/utils/firestoreUtils'; // Adjust the path as needed
// import { auth } from '../app/firebaseConfig';

// const systemPrompt = `
// You are a helpful and knowledgeable virtual assistant designed to assist customers with questions and inquiries related to Starbucks. 
// You can help customers with both in-store and at-home products. You have extensive knowledge of Starbucks' in-store offerings, 
// including beverages, food items, merchandise, store locations, store hours, and the Starbucks Rewards program. 
// Additionally, you are well-versed in Starbucks products for home use, such as various coffee beans, brewing methods, 
// and recipes for making Starbucks-style coffee at home, referencing information from athome.starbucks.com.

// When you greet a customer, start by asking if they have questions about store products, the Starbucks Rewards program, at-home products, or something else, so you can better answer their questions. 
// Based on their response, provide clear, concise, and accurate information in a friendly and professional manner.

// You can serve customers in multiple languages, including English, Spanish, and Chinese. 
// Please detect the language of the user's inquiry and respond in the same language. 

// If a customer asks a question that is outside your knowledge base, politely let them know and suggest contacting 
// customer service or visiting the Starbucks website for more detailed assistance.
// `;

// export default function ChatComponent() {
//   const [user, setUser] = useState(null);
//   const [responseMessage, setResponseMessage] = useState('');
//   const [userMessage, setUserMessage] = useState('');
//   const [chatHistory, setChatHistory] = useState([]); // Store the chat history
  

//   useEffect(() => {
//     // Listen for changes in authentication state
//     const unsubscribe = auth.onAuthStateChanged(async (user) => {
//       if (user) {
//         setUser(user);
//         const history = await loadChatHistory(user.uid); // Load chat history from Firestore
//         setChatHistory(history.length ? history : [{ role: 'assistant', content: "Hello! I am your Starbucks assistant. How can I assist you today?" }]);
//       } else {
//         setUser(null);
//         setChatHistory([{ role: 'assistant', content: "Hello! I am your Starbucks assistant. How can I assist you today?" }]);
//       }
//     });

//     // Cleanup the subscription on unmount
//     return () => unsubscribe();
//   }, []);


//   const handleChat = async () => {
//     if (userMessage.trim() === '') return; // Prevent sending empty messages

//     const updatedChatHistory = [
//       ...chatHistory,
//       { role: 'user', content: userMessage }
//     ];

//     try {
//       const response = await fetch('/api/chat', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           messages: [
//             { role: 'system', content: systemPrompt },
//             ...updatedChatHistory // Include the full conversation history
//            // { role: 'user', content: userMessage }
//           ]
//         }),
//       });

//       const data = await response.json();
//       setChatHistory([...updatedChatHistory,  { role: 'assistant', content: data.message }]);
//       setUserMessage(''); // Clear the input field
//       // Save the updated chat history to Firestore
//       if (user) {
//         await saveChatHistory(user.uid, newChatHistory);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       setResponseMessage('There was an error processing your request.');
//     }
//   };
       

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' || e.keyCode === 13) {
//       handleChat();
//     }
//   };

//   return (
//     <div style={styles.chatContainer}>
//       <div style={styles.chatBox}>
//         {chatHistory.map((msg, index) => (
//           <div key={index} style={msg.role === 'user' ? styles.userMessage : styles.botMessage}>
//             {msg.content}
//           </div>
//         ))}
//       </div>
//       <div style={styles.inputContainer}>
//         <input
//           type="text"
//           value={userMessage}
//           onChange={(e) => setUserMessage(e.target.value)}
//           onKeyPress={handleKeyPress} // Listen for Enter key press
//           placeholder="Type your message here"
//           style={styles.inputField}
//         />
//         <button onClick={handleChat} style={styles.sendButton}>Send</button>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { saveChatHistory, loadChatHistory, clearChatHistory  } from '../app/utils/firestoreUtils';
import { auth } from '../app/firebaseConfig';

const systemPrompt = `
You are a helpful and knowledgeable virtual assistant designed to assist customers with questions and inquiries related to Starbucks. 
...
`;

export default function ChatComponent() {
  const [user, setUser] = useState(null);
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const history = await loadChatHistory(user.uid);
        setChatHistory(history.length ? history : [{ role: 'assistant', content: "Hello! I am your Starbucks assistant. How can I assist you today?" }]);
      } else {
        setUser(null);
        setChatHistory([{ role: 'assistant', content: "Hello! I am your Starbucks assistant. How can I assist you today?" }]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleChat = async () => {
    if (userMessage.trim() === '') return;

    const updatedChatHistory = [
      ...chatHistory,
      { role: 'user', content: userMessage }
    ];

    setChatHistory(updatedChatHistory);
    setUserMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...updatedChatHistory
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';

      setChatHistory(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        assistantResponse += text;
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].content = assistantResponse;
          return newHistory;
        });
      }

      if (user) {
        await saveChatHistory(user.uid, [...updatedChatHistory, { role: 'assistant', content: assistantResponse }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'There was an error processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };

  const handleClearHistory = async () => {
    if (user) {
      await clearChatHistory(user.uid);
      setChatHistory([{ role: 'assistant', content: "Chat history cleared. How can I assist you today?" }]);
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
        <div ref={chatEndRef} />
      </div>
      <div style={styles.inputContainer}>
        <textarea
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here"
          style={styles.inputField}
          disabled={isLoading}
        />
        <button onClick={handleChat} style={styles.sendButton} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
      {user && (
        <button onClick={handleClearHistory} style={styles.clearButton}>
          Clear Chat History
        </button>
      )}
    </div>
  );
}

// Inline styles for demonstration
const styles = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '70vh',
    width: 'calc(100% - 40px)',
    maxWidth: '600px',
    margin: '0 auto 20px',
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
    // borderRadius: '5px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    marginRight: '10px',
    fontSize: '16px', // Increase font size for better readability
  },
  sendButton: {
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    // backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    // borderRadius: '5px',
    borderRadius: '20px',
    cursor: 'pointer',
  },
  clearButton: {
    // backgroundColor: '#f44336',
    backgroundColor: '#ebe6e1',
    // backgroundColor: '#FFD1DC', // Light pink color
    color: '#FF69B4', // Hot pink color for text
    border: 'none',
    // padding: '10px 20px',
    // borderRadius: '5px',
    padding: '10px 15px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',//add0830
    fontWeight: 'bold',//add0830
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',//add0830
    transition: 'all 0.3s ease',
    alignSelf: 'center',
    marginTop: '10px',
    ':hover': {
      backgroundColor: '#c53929', // Slightly darker on hover
      transform: 'scale(1.05)',
    }
    
  },
};