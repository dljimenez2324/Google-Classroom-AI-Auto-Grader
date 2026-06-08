import { useState, useEffect } from 'react';
import './App.css';
import Settings from './components/Settings';
import SetupGuide from './components/SetupGuide';
import Grading from './components/Grading';

function App({ isSidePanel }) {
  const [activeTab, setActiveTab] = useState('grading');

  const openSidePanel = async () => {
    if (chrome?.windows && chrome?.sidePanel) {
      const currentWindow = await chrome.windows.getCurrent();
      await chrome.sidePanel.open({ windowId: currentWindow.id });
      window.close(); // Close the popup
    } else {
      alert("Please run this as a Chrome Extension.");
    }
  };

  if (!isSidePanel) {
    // Popup UI
    return (
      <div className="app-container popup-container">
        <h1>AutoGrader</h1>
        <p>Your AI-powered assistant for grading Google Classroom submissions.</p>
        <button onClick={openSidePanel} className="primary-btn">
          Open Grading Panel
        </button>
      </div>
    );
  }

  // Side Panel UI
  return (
    <div className="app-container side-panel-container">
      <h1>Google Classroom AutoGrader</h1>
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'grading' ? 'active' : ''}`}
          onClick={() => setActiveTab('grading')}
        >Grading</button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >Settings</button>
        <button 
          className={`tab-btn ${activeTab === 'setup' ? 'active' : ''}`}
          onClick={() => setActiveTab('setup')}
        >Setup Guide</button>
      </div>
      <div className="content-area">
        {activeTab === 'grading' && <Grading />}
        {activeTab === 'settings' && <Settings />}
        {activeTab === 'setup' && <SetupGuide />}
      </div>
    </div>
  );
}

export default App;
