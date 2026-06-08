import { useState, useEffect } from 'react';

export default function Settings() {
  const [geminiKey, setGeminiKey] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (chrome?.storage?.local) {
      chrome.storage.local.get(['geminiApiKey', 'googleClientId'], (result) => {
        if (result.geminiApiKey) setGeminiKey(result.geminiApiKey);
        if (result.googleClientId) setGoogleClientId(result.googleClientId);
      });
    }
  }, []);

  const handleSave = () => {
    if (chrome?.storage?.local) {
      chrome.storage.local.set({
        geminiApiKey: geminiKey,
        googleClientId: googleClientId
      }, () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      });
    } else {
      alert("Please run this in a Chrome Extension environment.");
    }
  };

  return (
    <div className="settings-container">
      <h2>API Configuration</h2>
      <p className="description">Enter your API keys to enable AutoGrader. These keys are stored locally on your device and are never sent to any external server.</p>
      
      <div className="form-group">
        <label htmlFor="geminiKey">Gemini API Key</label>
        <input 
          type="password" 
          id="geminiKey"
          value={geminiKey}
          onChange={(e) => setGeminiKey(e.target.value)}
          placeholder="AIzaSy..."
        />
        <small>Used for evaluating submissions.</small>
      </div>

      <div className="form-group">
        <label htmlFor="googleClientId">Google OAuth Client ID</label>
        <input 
          type="text" 
          id="googleClientId"
          value={googleClientId}
          onChange={(e) => setGoogleClientId(e.target.value)}
          placeholder="1234567890-abc123def456...apps.googleusercontent.com"
        />
        <small>Used to access Google Classroom and Drive.</small>
      </div>

      <button className="primary-btn" onClick={handleSave}>
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
