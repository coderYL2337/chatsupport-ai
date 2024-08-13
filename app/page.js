import Image from "next/image";
import styles from "../app/page.module.css";
import ChatComponent from '../components/ChatComponent.js';  // Adjust the path as needed
import SignIn from '../components/SignIn';


export default function Home() {
  return (
    <div>
      <h1>Welcome to Chat Support</h1>
      <SignIn /> {/* Add this to render the SignIn component */}
      <ChatComponent />
    </div>
  );
}






