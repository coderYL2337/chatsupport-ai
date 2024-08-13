// components/SignIn.js
"use client";
import { useState } from 'react';
import { auth } from '../app/firebaseConfig';
import { getAuth,signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import styles from './page.module.css'; // Import the CSS module

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const provider = new GoogleAuthProvider();

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Signed in:', userCredential.user);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithPopup(auth, provider);
      console.log('Signed in with Google:', userCredential.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };


  return (
    <div style={styles.signInContainer}>
      <input 
        type="email" 
        placeholder="Email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)} 
        style={styles.inputField}
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)} 
        style={styles.inputField}
      />
      <button onClick={handleSignIn} style={styles.signInButton}>Sign In</button>
      <button onClick={handleGoogleSignIn} style={styles.googleSignInButton}>Sign In with Google</button>
      <p style={styles.signUpPrompt}>Don't have an account? <a href="/signup" style={styles.signUpLink}>Sign up here</a></p>
    </div>
  );
};

export default SignIn;
