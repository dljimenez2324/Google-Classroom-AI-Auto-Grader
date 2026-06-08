export default function SetupGuide() {
  return (
    <div className="setup-guide-container">
      <h2>Initial Setup Guide</h2>
      <p className="description">To use this extension, you need two API keys. Follow these steps to obtain them.</p>

      <div className="step-card">
        <h3>1. Get your Gemini API Key</h3>
        <ol>
          <li>Go to Google AI Studio: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">aistudio.google.com</a></li>
          <li>Click on "Create API key".</li>
          <li>Copy the generated key and paste it into the <strong>Settings</strong> tab.</li>
        </ol>
      </div>

      <div className="step-card">
        <h3>2. Get your Google OAuth Client ID</h3>
        <ol>
          <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer">Google Cloud Console</a>.</li>
          <li>Create a new Project.</li>
          <li>Enable the following APIs: <strong>Google Classroom API</strong>, <strong>Google Docs API</strong>, and <strong>Google Slides API</strong>.</li>
          <li>Go to <strong>APIs & Services &gt; OAuth consent screen</strong>. Configure it for "External" and add your email as a test user.</li>
          <li>Go to <strong>Credentials &gt; Create Credentials &gt; OAuth client ID</strong>.</li>
          <li>Select <strong>Chrome App</strong> or <strong>Web application</strong> (since this is an extension, you may need to add the extension ID `chrome-extension://...` as an authorized origin). For easier local extension testing, <strong>Web application</strong> is common.</li>
          <li>Copy the Client ID and paste it into the <strong>Settings</strong> tab.</li>
        </ol>
      </div>
      
      <p>Once you have both configured, head over to the <strong>Grading</strong> tab to get started!</p>
    </div>
  );
}
