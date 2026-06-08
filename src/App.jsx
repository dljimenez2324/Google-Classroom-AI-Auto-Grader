import { useState, useEffect } from 'react';
import './App.css';

function App({ isSidePanel }) {
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
        <button className="tab-btn active">Grading</button>
        <button className="tab-btn">Settings</button>
        <button className="tab-btn">Setup Guide</button>
      </div>
      <div className="content-area">
        <p>Welcome to the AutoGrader Side Panel.</p>
        {/* We will build out the rest of the UI in Phase 2 & 3 */}
      </div>
    </div>
  );
}

export default App;
