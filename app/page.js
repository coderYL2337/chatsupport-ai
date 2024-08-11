import Image from "next/image";
import styles from "./page.module.css";
import ChatComponent from '../components/ChatComponent.js';  // Adjust the path as needed

export default function Home() {
  return (
    <div>
      <h1>Welcome to Chat Support</h1>
      <ChatComponent />
    </div>
  );
}

