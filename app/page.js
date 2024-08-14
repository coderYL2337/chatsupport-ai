'use client';
import Image from "next/image";
import styles from "./page.module.css";
import ChatComponent from '../components/ChatComponent.js';
import SignIn from '../components/SignIn';
import SignInWrapper from '../components/SignInWrapper';

export default function Home() {
  
  return (
    <div className={styles.mainContainer}>
      <h1 className={styles.title}>Welcome to Chat Support</h1>
      <SignInWrapper />
      <div className="contentWrapper">
        <ChatComponent />
      </div>
    </div>
  );
}





