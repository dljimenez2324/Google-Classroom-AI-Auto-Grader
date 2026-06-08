// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Google Classroom AI AutoGrader installed.');
  
  // By default, let's enable the side panel to open on action click
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));
});
