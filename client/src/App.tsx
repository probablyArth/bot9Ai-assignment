import "./App.css";
import ChatWindow from "./components/ChatWindow";

function App() {
  return (
    <>
      <div>
        <ChatWindow sessionToken={window.crypto.randomUUID()} />
      </div>
    </>
  );
}

export default App;
