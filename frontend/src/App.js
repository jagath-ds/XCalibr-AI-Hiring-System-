// In src/App.js
import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import VideoModal from './components/VideoModal'; // <-- 1. ADD THE IMPORT

function App() {
  return (
    <div className="App">
      <Navbar />
      <h1>Welcome to XCalibr</h1>
      <p>This is the main content of the home page.</p>
      
      <VideoModal /> {/* <-- 2. ADD THE COMPONENT TAG */}
      
    </div>
  );
}

export default App;