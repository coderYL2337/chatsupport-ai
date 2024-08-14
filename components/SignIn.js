"use client";
import { useState,useEffect } from 'react';
import { auth } from '../app/firebaseConfig';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import styles from '../app/globals.css';
import Link from 'next/link';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const togglePopup = () => setIsPopupOpen(!isPopupOpen);

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Signed in:', userCredential.user);
      togglePopup(); // Close the popup on successful sign-in
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithPopup(auth, provider);
      console.log('Signed in with Google:', userCredential.user);
      togglePopup(); // Close the popup on successful sign-in
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push('/'); // Redirect to home page after sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
    {user ? (
       <div className="signedInContainer">
       <p>Signed in as {user.email}</p>
       <button onClick={handleSignOut} className="signOutButton">Sign Out</button>
     </div>
   ) : (
      <button onClick={togglePopup} className="signInButton">Sign In</button>
    )}
      {isPopupOpen && (
        <div className="popupOverlay" onClick={togglePopup}>
          <div className="signInContainer" onClick={(e) => e.stopPropagation()}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="inputField"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="inputField"
            />
            <button onClick={handleSignIn} className="signInButton">Sign In</button>
            <button onClick={handleGoogleSignIn} className="googleSignInButton">Sign In with Google</button>
            <p className="signUpPrompt">Don't have an account? <Link href="/signup" className="signUpLink">Sign up here</Link></p>
          </div>
        </div>
      )}
    </>
  );
};

export default SignIn;
