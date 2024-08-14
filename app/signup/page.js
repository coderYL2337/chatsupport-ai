"use client";
import { useState } from 'react';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import styles from '../signup.module.css';
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redirect to home page after sign-up
    } catch (error) {
      console.error('Error signing up:', error.code, error.message);
      setError(error.message);
    }
  };

  const handleCancel = () => {
    router.push('/'); // Return to home page
  };

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h1 className={styles.title}>Sign Up</h1>
        <div className={styles.signUpContainer}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.inputField}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputField}
          />
          <button onClick={handleSignUp} className={styles.signUpButton}>Sign Up</button>
          <button onClick={handleCancel} className={styles.cancelButton}>Cancel</button>
          {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

