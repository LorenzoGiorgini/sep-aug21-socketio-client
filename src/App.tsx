import React, { useState } from "react";
import "./App.css";
import Home from "./components/Home";
import PrivateChat from "./components/PrivateChat";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {

  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home username={username} setUsername={setUsername} loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>} />
        <Route path="/chat/:id" element={<PrivateChat username={username} loggedIn={loggedIn} />} />
      </Routes>
    </Router>
  );
}


export default App;